# Which pages take part in "Related pages", and how each one is labelled.
#
#   suggestable?  may appear in another page's list. Front matter
#                 `suggest_as_related: false` opts a page out; posts are
#                 opted out unless they set it to true.
#   shows_rail?   gets a "Related pages" list of its own: pages that include
#                 related_pages.html (in their content or any of their
#                 layouts), unless front matter says `related_pages: false`
#   label_for     the title of the site nav section the page belongs to
#                 (e.g. "Standards"): the section that links to the page, or
#                 to its first breadcrumb. Posts are "Updates"; pages in no
#                 section are "Learn".
#   code_for      the page's reference (PUB01, UC07), or nil

module Jekyll
  module RelatedPages
    class PageRules
      TABLE_SUFFIX_RE = /-table(-v\d+)?\z/.freeze
      DIFF_INFIX_RE   = /-diff-/.freeze
      POSTS_LABEL     = "Updates"
      FALLBACK_LABEL  = "Learn"
      INCLUDE_RE      = /\{%-?\s*include\s+related_pages\.html\b/.freeze

      def initialize(nav, layouts)
        @nav_labels = nav_labels(nav)
        @layouts    = layouts
      end

      def suggestable?(doc)
        content_page?(doc) &&
          doc.data.fetch("suggest_as_related", !post?(doc)) != false &&
          !versioned_page?(doc) &&
          !table_page?(doc) &&
          !diff_page?(doc)
      end

      def shows_rail?(doc)
        content_page?(doc) &&
          includes_sidebar?(doc) &&
          doc.data["related_pages"] != false &&
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

      # The page's own content, or a layout it uses (directly or via a parent
      # layout), has {% include related_pages.html %}.
      def includes_sidebar?(doc)
        return true if doc.content.to_s.match?(INCLUDE_RE)

        layout = @layouts[doc.data["layout"]]
        while layout
          return true if layout.content.match?(INCLUDE_RE)

          layout = @layouts[layout.data["layout"]]
        end
        false
      end

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
