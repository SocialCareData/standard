# _plugins/toc.rb
#
# Adds a {% toc %} Liquid tag intended for use in LAYOUTS.
# It parses the page's already-rendered HTML (so it works even though
# layouts never go through kramdown) and builds a nested TOC from the
# heading ids that kramdown's auto_ids already generated.
#
# Usage in a layout:
#
#   {% toc %}
#   {{ content }}
#
# Usage in a page's front matter (only pages that opt in get a TOC):
#
#   ---
#   title: My page
#   toc: true
#   toc_min: 2        # optional, default 2
#   toc_max: 3        # optional, default 3
#   ---
#
# Site-wide defaults can be set in _config.yml:
#
#   toc:
#     min_level: 2
#     max_level: 3
#
# Requirements: kramdown auto_ids must be enabled (it is by default),
# since the tag links to the ids kramdown puts on headings.

module Jekyll
  class TocTag < Liquid::Tag
    HEADING_RE = %r{<h([1-6])[^>]*\bid="([^"]+)"[^>]*>(.*?)</h\1>}m.freeze

    def render(context)
      page = context.registers[:page]
      return "" if page.nil? || page["toc"] == false

      # `content` is the page's converted HTML, available inside layouts.
      html = context["content"]
      return "" if html.nil? || html.empty?

      site_cfg = (context.registers[:site].config["toc"] || {})
      min = (page["toc_min"] || site_cfg["min_level"] || 2).to_i
      max = (page["toc_max"] || site_cfg["max_level"] || 3).to_i

      headings = html.scan(HEADING_RE).map do |level, id, text|
        {
          level: level.to_i,
          id: id,
          text: text.gsub(/<[^>]+>/, "").strip # strip inline markup
        }
      end
      headings.select! { |h| h[:level] >= min && h[:level] <= max }

      return "" if headings.empty?

      build_list(headings)
    end

    private

    # Builds a nested <ol> from a flat list of headings, tolerating
    # level jumps (e.g. h2 -> h4) and out-of-order documents.
    def build_list(headings)
      out = +%(<ol>)
      stack = [headings.first[:level]]

      headings.each_with_index do |h, i|
        if i.zero?
          # first item: just open it below
        elsif h[:level] > stack.last
          out << "<ol>"
          stack.push(h[:level])
        else
          out << "</li>"
          while stack.length > 1 && h[:level] < stack.last
            stack.pop
            out << "\n</ol></li>"
          end
        end
        out << %(\n<li><a href="##{h[:id]}">#{h[:text]}</a>)
      end

      out << "</li>"
      (stack.length - 1).times { out << "\n</ol></li>" }
      out << "\n</ol>"
      out
    end
  end
end

Liquid::Template.register_tag("toc", Jekyll::TocTag)
