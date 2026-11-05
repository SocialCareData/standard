# Works out each page's "Related pages" list at build time and stores it as
# page.related_links ([{url, title, label, code}]). After the page is
# rendered, Sidebar puts _includes/related_pages.html beside the page content,
# so layouts need no changes.
#
# For each page that shows the list:
#   1. Editor picks first, in the order listed in the page's front matter:
#        related:
#          - /PUB01_person_standard
#          - /UC09_multi_agency_enquiries
#   2. Remaining slots (up to max_links) are filled automatically: candidates
#      are scored on text similarity, links, shared tags and reverse editor
#      picks, weak matches are dropped, and the rest
#      are picked with MMR so the list is varied.
#   3. Pages with fewer than min_links get no list.
#
# A page can opt out of showing the list with `related_pages: false`; it can
# still be suggested on other pages. Which pages show or are suggested lives
# under `related_pages:` in _config.yml; scoring constants are in Settings
# below. Run `jekyll build --verbose` to log each page's scores.

require "set"
require_relative "standard_metadata"
require_relative "breadcrumb_pages"
require_relative "related_pages/page_rules"
require_relative "related_pages/text_index"
require_relative "related_pages/link_graph"
require_relative "related_pages/tag_index"
require_relative "related_pages/scorer"

module Jekyll
  module RelatedPages
    class Settings
      # Scoring and selection tuning.
      WEIGHTS = {
        "text"   => 0.5,  # TF-IDF similarity of the page text
        "links"  => 0.25, # pages link to each other, or are linked from the same pages
        "tags"   => 0.1, # shared tags, rare tags counting more
        "editor" => 0.15   # an editor listed this page as related the other way round
      }.freeze
      MIN_SCORE           = 0.35 # automatic suggestions scoring below this are dropped
      TEXT_SCALE_FLOOR    = 0.1  # a page's best text match below this is not scaled up to 1
      MMR_LAMBDA          = 0.7  # 1 = relevance only, 0 = variety only
      MAX_SAME_TYPE       = 3    # at most this many of one label (e.g. Use Cases)
      MAX_POSTS           = 1
      GENERIC_TAGS        = ["Publication", "Use Case", "Programme"].freeze # page-type tags that count for almost nothing

      # Defaults for the `related_pages:` block in _config.yml.
      CONFIG_DEFAULTS = {
        "max_links"     => 5,
        "min_links"     => 2,
        "hide_on"       => [],
        "never_suggest" => ["/"]
      }.freeze

      attr_reader :max_links, :min_links, :hide_on, :never_suggest

      def initialize(config)
        values = CONFIG_DEFAULTS.merge(config || {})

        @max_links     = values["max_links"].to_i
        @min_links     = values["min_links"].to_i
        @hide_on       = UrlPatterns.new(values["hide_on"])
        @never_suggest = UrlPatterns.new(values["never_suggest"])
      end

      def weights;             WEIGHTS;             end
      def min_score;           MIN_SCORE;           end
      def text_scale_floor;    TEXT_SCALE_FLOOR;    end
      def mmr_lambda;          MMR_LAMBDA;          end
      def max_same_type;       MAX_SAME_TYPE;       end
      def max_posts;           MAX_POSTS;           end
      def generic_tags;        GENERIC_TAGS;        end
    end

    # Links to other pages in a page's source: [text](/path) or href="/path".
    LINK_RE = %r{\]\((/[^)\s]*)|href="(/[^"]*)"}.freeze

    # "/foo#bar", "/foo?x=1" and "/foo/" all mean the page /foo.
    def self.page_url(href)
      url = href.to_s.strip.sub(/[?#].*/, "")
      url.length > 1 ? url.chomp("/") : url
    end

    def self.links_in(text)
      text.to_s.scan(LINK_RE).map { |markdown, html| page_url(markdown || html) }.uniq
    end

    class Generator < Jekyll::Generator
      safe true
      priority :low # after BreadcrumbPageGenerator has added its pages

      def generate(site)
        @settings = Settings.new(site.config["related_pages"])
        @rules    = PageRules.new(@settings, site.config["nav"])

        docs          = (site.pages + site.posts.docs).select { |doc| @rules.content_page?(doc) }
        @docs_by_url  = docs.to_h { |doc| [doc.url, doc] }
        @editor_picks = editor_picks_by_url(docs)
        @candidates   = docs.select { |doc| @rules.suggestable?(doc) }
        rail_docs     = docs.select { |doc| @rules.shows_rail?(doc) }

        build_indexes(indexed_docs(rail_docs))

        rail_docs.each do |doc|
          links = related_docs(doc).map { |related| link_data(related) }
          doc.data["related_links"] = links if links.size >= @settings.min_links
        end
      end

      private

      # Only pages that are scored or need a list of their own are indexed
      def indexed_docs(rail_docs)
        picked = @editor_picks.values.flatten.filter_map { |url| @docs_by_url[url] }
        (rail_docs + @candidates + picked).uniq
      end

      def build_indexes(docs)
        text_index = TextIndex.new(docs)
        @scorer    = Scorer.new(text_index: text_index, link_graph: LinkGraph.new(docs),
                                tag_index: TagIndex.new(docs, @settings.generic_tags),
                                settings: @settings, editor_picks: @editor_picks)
        @selector  = MmrSelector.new(text_index: text_index, rules: @rules, settings: @settings)
      end

      def related_docs(doc)
        picked = editor_picks(doc)
        picked + automatic_picks(doc, picked)
      end

      # Pages listed under `related:` in the page's own front matter.
      def editor_picks(doc)
        @editor_picks.fetch(doc.url, []).filter_map { |url| @docs_by_url[url] }.first(@settings.max_links)
      end

      def automatic_picks(doc, picked)
        slots = @settings.max_links - picked.size
        return [] if slots <= 0

        candidates = @candidates.reject { |c| c.url == doc.url || picked.include?(c) }
        scored     = @scorer.score_candidates(doc, candidates)
        relevant   = @scorer.above_threshold(scored)
        chosen     = @selector.select(relevant, already_picked: picked, limit: slots)

        log_scores(doc, scored, chosen)
        chosen
      end

      # url => [urls the editor listed], with unknown and self links dropped.
      def editor_picks_by_url(docs)
        urls = docs.map(&:url).to_set
        docs.to_h do |doc|
          listed = Array(doc.data["related"]).map { |url| RelatedPages.page_url(url) }.uniq
          listed.each do |url|
            Jekyll.logger.warn("RelatedPages:", "#{doc.relative_path}: related page #{url} not found") unless urls.include?(url)
          end
          if listed.size > @settings.max_links
            Jekyll.logger.warn("RelatedPages:", "#{doc.relative_path}: only the first #{@settings.max_links} related pages are shown")
          end
          [doc.url, listed.select { |url| urls.include?(url) && url != doc.url }]
        end
      end

      def link_data(doc)
        { "url" => doc.url, "title" => doc.data["title"].to_s,
          "label" => @rules.label_for(doc), "code" => @rules.code_for(doc) }
      end

      def log_scores(doc, scored, chosen)
        return unless Jekyll.logger.level == :debug

        relevance = scored.to_h { |c| [c.doc.url, c.relevance] }
        picks     = chosen.map { |c| format("%s (%.2f)", c.url, relevance[c.url]) }
        Jekyll.logger.debug("RelatedPages:", "#{doc.url} -> #{picks.join(', ')}")
        scored.sort_by { |c| -c.relevance }.first(10).each do |c|
          signals = c.signals.map { |name, value| format("%s=%.2f", name, value) }.join(" ")
          Jekyll.logger.debug("", format("  %.3f %-55s %s", c.relevance, c.doc.url, signals))
        end
      end
    end

    # Puts the rendered "Related pages" sidebar next to the page content in the
    # final HTML:
    #
    #   <div class="with-related"><div>CONTENT</div><aside>…</aside></div>
    #
    # The content is found by its exact converted HTML, so whichever layout
    # wraps it (a numbered article, the default layout's article) still does.
    # Running after rendering keeps the sidebar out of page.content, which the
    # Table of Contents, the feed and the updates page read.
    module Sidebar
      INCLUDE_FILE = "related_pages.html"

      module_function

      def insert(doc)
        return unless doc.data["related_links"] && doc.output

        content = doc.content.to_s
        start   = content.strip.empty? ? nil : doc.output.index(content, doc.output.index("<main").to_i)
        unless start
          Jekyll.logger.warn("RelatedPages:", "#{doc.relative_path}: page content not found, sidebar not added")
          return
        end

        wrapped = %(<div class="with-related"><div>#{content}</div>#{render(doc)}</div>)
        doc.output = doc.output[0...start] + wrapped + doc.output[(start + content.length)..-1]
      end

      def render(doc)
        site = doc.site
        path = site.in_source_dir(site.config["includes_dir"], INCLUDE_FILE)
        site.liquid_renderer.file(path).parse(File.read(path))
            .render!({ "page" => { "related_links" => doc.data["related_links"] } }, registers: { site: site })
      end
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  Jekyll::RelatedPages::Sidebar.insert(doc)
end
