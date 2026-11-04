# _plugins/related_pages/page_rules.rb
#
# Which pages take part in "Related pages", and how each one is labelled.
#
#   suggestable?  may appear in another page's list
#   shows_rail?   gets a "Related pages" list of its own
#   label_for     "Standard", "Use case", "Learn" or "Get involved"
#   code_for      PUBxx / UCxx reference, or nil
#
# UrlPatterns holds the hide_on / never_suggest lists from _config.yml. Each
# entry is an exact url (/use_cases) or a glob pattern (/*_mais_swg):
# * any characters, ? any one character, {a,b} either a or b. Entries are
# canonicalised like page urls, so /use_cases/ and /use_cases.html both match
# /use_cases.

module Jekyll
  module RelatedPages
    class UrlPatterns
      FNMATCH_FLAGS = File::FNM_EXTGLOB

      def initialize(entries)
        @patterns = Array(entries).map { |entry| InternalLinks.canonical_url(entry.to_s.strip) }.uniq
      end

      def match?(url)
        @patterns.any? { |pattern| File.fnmatch?(pattern, url, FNMATCH_FLAGS) }
      end
    end

    class PageRules
      TABLE_SUFFIX_RE = /-table(-v\d+)?\z/.freeze
      DIFF_INFIX_RE   = /-diff-/.freeze
      LABELS_WITH_CODE = ["Standard", "Use case"].freeze

      def initialize(settings, get_involved_urls)
        @settings          = settings
        @get_involved_urls = get_involved_urls
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
        reference = doc.data["reference"].to_s
        return "Standard" if reference.start_with?("PUB")
        return "Use case" if reference.start_with?("UC") || doc.data["layout"] == "use-case"
        return "Get involved" if get_involved?(doc)

        "Learn"
      end

      # Only standards and use cases carry a code ("Standard · PUB00").
      def code_for(doc)
        return nil unless LABELS_WITH_CODE.include?(label_for(doc))

        reference = doc.data["reference"].to_s.strip
        reference.empty? ? nil : reference
      end

      private

      def get_involved?(doc)
        Array(doc.data["tags"]).include?("Working Group") || @get_involved_urls.include?(doc.url)
      end

      def basename(doc)
        File.basename(doc.relative_path.to_s, ".*")
      end
    end
  end
end
