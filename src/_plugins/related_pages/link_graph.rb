# _plugins/related_pages/link_graph.rb
#
# Which pages link to which, read from each page's source (the generator runs
# before rendering, so the built HTML the link checker reads does not exist
# yet). Link parsing is shared with check_internal_links.rb via InternalLinks.

require "set"

module Jekyll
  module RelatedPages
    class LinkGraph
      CO_CITATION_MAX = 0.5

      def initialize(docs)
        known     = docs.map(&:url).to_set
        @outbound = build_from_sources(docs, known)
        @inbound  = invert(@outbound)
      end

      # 1.0 when either page links to the other.
      def direct_link_score(url_a, url_b)
        links_to?(url_a, url_b) || links_to?(url_b, url_a) ? 1.0 : 0.0
      end

      # Up to 0.5 when other pages often link to both A and B
      # (cosine of the two pages' sets of linking pages).
      def co_citation_score(url_a, url_b)
        in_a = @inbound.fetch(url_a, Set.new)
        in_b = @inbound.fetch(url_b, Set.new)
        return 0.0 if in_a.empty? || in_b.empty?

        shared = (in_a & in_b).size
        CO_CITATION_MAX * shared / Math.sqrt(in_a.size * in_b.size)
      end

      private

      def build_from_sources(docs, known)
        docs.to_h do |doc|
          targets = InternalLinks.links_in_source(doc.content)
                                 .select { |url| known.include?(url) && url != doc.url }
          [doc.url, targets.to_set]
        end
      end

      def invert(outbound)
        inbound = Hash.new { |h, k| h[k] = Set.new }
        outbound.each { |source, targets| targets.each { |target| inbound[target] << source } }
        inbound
      end

      def links_to?(from, to)
        @outbound.fetch(from, Set.new).include?(to)
      end
    end
  end
end
