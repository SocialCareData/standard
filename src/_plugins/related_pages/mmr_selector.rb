# _plugins/related_pages/mmr_selector.rb
#
# Maximal marginal relevance: picks candidates one at a time, each time taking
# the one with the best balance of relevance to page A and dissimilarity to
# the pages already picked:
#
#   mmr = λ × relevance − (1 − λ) × max text similarity to already-picked pages
#
# Picks also respect `max_same_type` (per label, e.g. at most two use cases)
# and `max_posts`. Pages already picked by an editor count towards both caps.

module Jekyll
  module RelatedPages
    class MmrSelector
      def initialize(text_index:, rules:, settings:)
        @text_index = text_index
        @rules      = rules
        @lambda     = settings.mmr_lambda
        @max_type   = settings.max_same_type
        @max_posts  = settings.max_posts
      end

      # scored:         Scored candidates (already above the threshold)
      # already_picked: docs chosen by an editor
      # Returns up to `limit` docs, in pick order.
      def select(scored, already_picked:, limit:)
        picked    = already_picked.dup
        remaining = normalise_relevance(scored).sort_by { |c| c.doc.url }
        chosen    = []

        while chosen.size < limit
          allowed = remaining.select { |c| within_caps?(c.doc, picked) }
          break if allowed.empty?

          best = allowed.max_by { |c| mmr_score(c, picked) } # max_by keeps the first on ties
          chosen << best.doc
          picked << best.doc
          remaining.delete(best)
        end

        chosen
      end

      private

      # Relevance scaled so the best candidate is 1, putting it on the same
      # 0..1 scale as text similarity.
      def normalise_relevance(scored)
        top = scored.map(&:relevance).max.to_f
        return scored if top.zero?

        scored.map { |c| c.dup.tap { |copy| copy.relevance = c.relevance / top } }
      end

      def mmr_score(candidate, picked)
        redundancy = picked.map { |doc| @text_index.cosine(candidate.doc.url, doc.url) }.max || 0.0
        @lambda * candidate.relevance - (1 - @lambda) * redundancy
      end

      def within_caps?(doc, picked)
        same_type = picked.count { |p| @rules.label_for(p) == @rules.label_for(doc) }
        return false if same_type >= @max_type
        return true unless @rules.post?(doc)

        picked.count { |p| @rules.post?(p) } < @max_posts
      end
    end
  end
end
