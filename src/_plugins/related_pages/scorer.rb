# Scorer: how related candidate page B is to page A.
#
#   relevance = Σ weightᵢ × signalᵢ
#
# Signals (each 0..1):
#   text    TF-IDF cosine, scaled so A's best match scores 1
#   links   1.0 if A and B link to each other, else up to 0.5 for co-citation
#   tags    weight of shared tags, rare tags counting more
#   editor  1.0 if an editor listed A as related on B (the reverse direction)
#
# above_threshold drops automatic candidates scoring below min_score, so a
# page with few genuinely related pages gets a shorter list (or none) rather
# than being padded with unrelated links. Editor picks are never filtered.
#
# MmrSelector: which of the scored candidates to show.
#
# Maximal marginal relevance: picks candidates one at a time, each time taking
# the one with the best balance of relevance to page A and dissimilarity to
# the pages already picked:
#
#   mmr = λ × relevance − (1 − λ) × max text similarity to already-picked pages
#
# Picks also respect `max_same_type` (per label, e.g. at most three use cases)
# and `max_posts`. Pages already picked by an editor count towards both caps.

module Jekyll
  module RelatedPages
    Scored = Struct.new(:doc, :signals, :relevance, keyword_init: true)

    class Scorer
      def initialize(text_index:, link_graph:, tag_index:, settings:, editor_picks:)
        @text_index   = text_index
        @link_graph   = link_graph
        @tag_index    = tag_index
        @settings     = settings
        @editor_picks = editor_picks
      end

      # Every candidate scored against page A.
      def score_candidates(doc_a, candidates)
        cosines = candidates.to_h { |b| [b.url, @text_index.cosine(doc_a.url, b.url)] }
        scale   = [cosines.values.max || 0.0, @settings.text_scale_floor].max

        candidates.map do |doc_b|
          signals = {
            "text"   => text_signal(cosines[doc_b.url], scale),
            "links"  => link_signal(doc_a, doc_b),
            "tags"   => tag_signal(doc_a, doc_b),
            "editor" => editor_pick_signal(doc_a, doc_b)
          }
          Scored.new(doc: doc_b, signals: signals, relevance: weighted_sum(signals))
        end
      end

      def above_threshold(scored)
        scored.select { |candidate| candidate.relevance >= @settings.min_score }
      end

      private

      def text_signal(cosine, scale)
        [cosine / scale, 1.0].min
      end

      def link_signal(doc_a, doc_b)
        [@link_graph.direct_link_score(doc_a.url, doc_b.url),
         @link_graph.co_citation_score(doc_a.url, doc_b.url)].max
      end

      def tag_signal(doc_a, doc_b)
        @tag_index.shared_tag_score(doc_a.url, doc_b.url)
      end

      def editor_pick_signal(doc_a, doc_b)
        @editor_picks.fetch(doc_b.url, []).include?(doc_a.url) ? 1.0 : 0.0
      end

      def weighted_sum(signals)
        signals.sum { |name, value| @settings.weights.fetch(name, 0.0) * value }
      end
    end

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
