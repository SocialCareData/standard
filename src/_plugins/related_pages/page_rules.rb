# Which pages take part in "Related pages", and how each one is labelled.
#
#   suggestable?  may appear in another page's list
#   shows_rail?   gets a "Related pages" list of its own
#   label_for     the title of the site nav section the page belongs to
#                 (e.g. "Standards"): the section that links to the page, or
#                 to its first breadcrumb. Posts are "Updates"; pages in no
#                 section are "Learn".
#   code_for      the page's reference (PUB01, UC07), or nil
#
# UrlPatterns holds the hide_on / never_suggest lists from _config.yml. Each
# entry is an exact url (/use_cases) or a glob pattern (/*_mais_swg):
# * any characters, ? any one character, {a,b} either a or b. Entries are
# read like page urls, so /use_cases/ matches /use_cases.

module Jekyll
  module RelatedPages
    class UrlPatterns
      FNMATCH_FLAGS = File::FNM_EXTGLOB

      def initialize(entries)
        @patterns = Array(entries).map { |entry| RelatedPages.page_url(entry) }.uniq
      end

      def match?(url)
        @patterns.any? { |pattern| File.fnmatch?(pattern, url, FNMATCH_FLAGS) }
      end
    end

    class PageRules
      TABLE_SUFFIX_RE = /-table(-v\d+)?\z/.freeze
      DIFF_INFIX_RE   = /-diff-/.freeze
      POSTS_LABEL     = "Updates"
      FALLBACK_LABEL  = "Learn"

      def initialize(settings, nav)
        @settings   = settings
        @nav_labels = nav_labels(nav)
      end

      def suggestable?(doc)
        content_page?(doc) &&
          !@settings.never_suggest.match?(doc.url) &&
          !versioned_page?(doc) &&
          !table_page?(doc) &&
          !diff_page?(doc)
      end

      def shows_rail?(doc)
        content_page?(doc) &&
          doc.data["related_pages"] != false &&
          !@settings.hide_on.match?(doc.url) &&
          !table_page?(doc) &&
          !diff_page?(doc)
      end

      # A titled HTML page or post written by an editor (not generated).
      def content_page?(doc)
        doc.output_ext == ".html" &&
          !doc.data["title"].to_s.strip.empty? &&
          !doc.data["breadcrumb_page"]
      end

      # PUB00-placements-standard-v1 is an old version of PUB00-placements-standard.
      def versioned_page?(doc)
        basename(doc).match?(StandardMetadataGenerator::VERSION_SUFFIX_RE)
      end

      def table_page?(doc)
        basename(doc).match?(TABLE_SUFFIX_RE)
      end

      def diff_page?(doc)
        doc.data.key?("current_spec") || doc.data.key?("previous_spec") ||
          basename(doc).match?(DIFF_INFIX_RE)
      end

      def post?(doc)
        doc.respond_to?(:collection) && doc.collection&.label == "posts"
      end

      def label_for(doc)
        return POSTS_LABEL if post?(doc)

        @nav_labels[doc.url] || @nav_labels[breadcrumb_url(doc)] || FALLBACK_LABEL
      end

      def code_for(doc)
        reference = doc.data["reference"].to_s.strip
        reference.empty? ? nil : reference
      end

      private

      # url => title of the top-level nav section it sits in. A section is also
      # reachable by the url its title would have as a breadcrumb (/about).
      def nav_labels(nav)
        Array(nav).each_with_object({}) do |section, labels|
          title = section["title"].to_s
          urls  = [section["url"], *Array(section["children"]).map { |child| child["url"] }].compact
          urls.each { |url| labels[RelatedPages.page_url(url)] ||= title }
          labels["/#{BreadcrumbPage.slugify(title)}"] ||= title
        end
      end

      # The page generated for the first breadcrumb (Publications -> /publications).
      def breadcrumb_url(doc)
        first = Array(doc.data["breadcrumbs"]).first
        first && "/#{BreadcrumbPage.slugify(first.to_s)}"
      end

      def basename(doc)
        File.basename(doc.relative_path.to_s, ".*")
      end
    end
  end
end
