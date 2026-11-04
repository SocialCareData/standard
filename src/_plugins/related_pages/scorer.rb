# _plugins/related_pages/scorer.rb
#
# How related candidate page B is to page A:
#
#   relevance = (Σ weightᵢ × signalᵢ) × recency
#
# Signals (each 0..1):
#   text    TF-IDF cosine, scaled so A's best match scores 1
#   links   1.0 if A and B link to each other, else up to 0.5 for co-citation
#   tags    weight of shared tags, rare tags counting more
#   editor  1.0 if an editor listed A as related on B (the reverse direction)
# Recency (posts only): 0.5 ^ (age_days / post_half_life_days)
#
# above_threshold drops automatic candidates scoring below min_score, so a
# page with few genuinely related pages gets a shorter list (or none) rather
# than being padded with unrelated links. Editor picks are never filtered.

module Jekyll
  module RelatedPages
    Scored = Struct.new(:doc, :signals, :recency, :relevance, keyword_init: true)

    class Scorer
      SECONDS_PER_DAY = 86_400.0

      def initialize(text_index:, link_graph:, tag_index:, rules:, settings:, editor_picks:, now:)
        @text_index   = text_index
        @link_graph   = link_graph
        @tag_index    = tag_index
        @rules        = rules
        @settings     = settings
        @editor_picks = editor_picks
        @now          = now
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
          recency = recency_factor(doc_b)
          Scored.new(doc: doc_b, signals: signals, recency: recency,
                     relevance: weighted_sum(signals) * recency)
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

      def recency_factor(doc)
        return 1.0 unless @rules.post?(doc)

        age_days = [(@now - doc.date) / SECONDS_PER_DAY, 0].max
        0.5**(age_days / @settings.post_half_life_days)
      end

      def weighted_sum(signals)
        signals.sum { |name, value| @settings.weights.fetch(name, 0.0) * value }
      end
    end
  end
end
