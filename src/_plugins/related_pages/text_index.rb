# TF-IDF vectors over page text, and cosine similarity between them.
#
# Each page's text is its body with Liquid and Markdown syntax stripped, plus
# its title (counted 3x) and description / non-technical summary (2x each),
# so that what a page says it is about outweighs incidental body text.
# Terms are single words and adjacent word pairs ("data sharing").

require "set"

module Jekyll
  module RelatedPages
    class TextIndex
      FIELD_REPEATS = { "title" => 3, "description" => 2, "non_technical_summary" => 2 }.freeze

      STOPWORDS = %w[
        about above after again against all also and any are aren because been before being below
        between both but can cannot could did does doing down during each etc few for from further
        had has have having her here hers herself him himself his how into its itself just let more
        most must not now off once only other our ours ourselves out over own same she should some
        such than that the their theirs them themselves then there these they this those through too
        under until upon very was way well were what when where which while who whom why will with
        within without would you your yours yourself yourselves may might many much via per use
        used using one two three new see e.g i.e
      ].to_set.freeze

      def initialize(docs)
        term_counts = docs.to_h { |doc| [doc.url, term_counts(weighted_text(doc))] }
        @vectors    = tfidf_vectors(term_counts)
      end

      # Cosine similarity of two pages' text, 0..1.
      def cosine(url_a, url_b)
        a = @vectors.fetch(url_a, {})
        b = @vectors.fetch(url_b, {})
        a, b = b, a if a.size > b.size
        a.sum { |term, weight| weight * b.fetch(term, 0.0) }
      end

      private

      def weighted_text(doc)
        fields = FIELD_REPEATS.flat_map do |field, repeats|
          [strip_markdown(strip_liquid(doc.data[field].to_s))] * repeats
        end
        (fields << strip_markdown(strip_liquid(doc.content.to_s))).join("\n")
      end

      def strip_liquid(text)
        text
          .gsub(/\{%-?\s*raw\s*-?%\}.*?\{%-?\s*endraw\s*-?%\}/m, " ")
          .gsub(/\{%.*?%\}/m, " ")
          .gsub(/\{\{.*?\}\}/m, " ")
      end

      def strip_markdown(text)
        text
          .gsub(/^\s*(```|~~~).*?^\s*\1/m, " ")       # fenced code blocks
          .gsub(/<!--.*?-->/m, " ")                    # HTML comments
          .gsub(/<[^>]+>/, " ")                        # HTML tags
          .gsub(/!\[[^\]]*\]\([^)]*\)/, " ")           # images
          .gsub(/\[([^\]]*)\]\([^)]*\)/, '\1')         # inline links -> text
          .gsub(/^\s*\[[^\]]+\]:\s*\S+.*$/, " ")       # reference definitions
          .gsub(%r{https?://\S+}, " ")                 # bare urls
          .gsub(/\{:[^}]*\}/, " ")                     # kramdown attribute lists
          .gsub(/[#*_`>|~\\]/, " ")                    # remaining markup characters
      end

      # Word and word-pair counts. Pairs are built from adjacent words within
      # a phrase (not across stopwords or punctuation).
      def term_counts(text)
        counts = Hash.new(0)
        phrases(text).each do |words|
          words.each { |w| counts[w] += 1 }
          words.each_cons(2) { |a, b| counts["#{a} #{b}"] += 1 }
        end
        counts
      end

      def phrases(text)
        text.downcase.split(/[^a-z0-9'’\s-]+|\s-\s/).flat_map do |chunk|
          chunk.split(/\s+/)
               .map { |w| w.gsub(/\A[^a-z0-9]+|[^a-z0-9]+\z/, "").delete("'’") }
               .slice_when { |_, w| !keep_word?(w) }
               .map { |run| run.select { |w| keep_word?(w) } }
               .reject(&:empty?)
        end
      end

      def keep_word?(word)
        word.length >= 3 && !STOPWORDS.include?(word) && !word.match?(/\A\d+\z/)
      end

      # Sublinear term frequency x smoothed inverse document frequency,
      # L2-normalised so a dot product is a cosine.
      def tfidf_vectors(term_counts)
        n  = term_counts.size.to_f
        df = Hash.new(0)
        term_counts.each_value { |counts| counts.each_key { |term| df[term] += 1 } }

        term_counts.transform_values do |counts|
          vector = counts.to_h do |term, count|
            [term, (1 + Math.log(count)) * (Math.log((1 + n) / (1 + df[term])) + 1)]
          end
          norm = Math.sqrt(vector.values.sum { |w| w * w })
          norm.zero? ? vector : vector.transform_values { |w| w / norm }
        end
      end
    end
  end
end
