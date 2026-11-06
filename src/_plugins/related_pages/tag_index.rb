# Shared-tag similarity where rare tags count for more than common ones: a
# shared "Placements" tag says more than a shared "MAIS", and page-type tags
# such as "Publication" (listed in Settings::GENERIC_TAGS) count for almost nothing.

module Jekyll
  module RelatedPages
    class TagIndex
      GENERIC_TAG_FACTOR = 0.1

      def initialize(docs, generic_tags)
        @tags_by_url  = docs.to_h { |doc| [doc.url, Array(doc.data["tags"]).map(&:to_s).uniq] }
        @generic_tags = generic_tags
        @weights      = tag_weights
      end

      # Weight of the tags A shares with B as a share of all A's tag weight, 0..1.
      def shared_tag_score(url_a, url_b)
        tags_a = @tags_by_url.fetch(url_a, [])
        total  = tags_a.sum { |tag| tag_weight(tag) }
        return 0.0 if total.zero?

        shared = tags_a & @tags_by_url.fetch(url_b, [])
        shared.sum { |tag| tag_weight(tag) } / total
      end

      def tag_weight(tag)
        @weights.fetch(tag, 0.0)
      end

      private

      # Inverse document frequency: ln(N / pages with the tag).
      def tag_weights
        n  = @tags_by_url.size.to_f
        df = Hash.new(0)
        @tags_by_url.each_value { |tags| tags.each { |tag| df[tag] += 1 } }

        df.to_h do |tag, count|
          weight = Math.log(n / count)
          weight *= GENERIC_TAG_FACTOR if @generic_tags.include?(tag)
          [tag, weight]
        end
      end
    end
  end
end
