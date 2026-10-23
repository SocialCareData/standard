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
# Pass `collapsible` ({% toc collapsible %}) for the standard pages' layout:
# one row per top-level section, numbered in the markup, with its subsections
# in a list that assets/js/toc.js folds behind a toggle button. The buttons
# ship `hidden`, so without JS every section simply renders expanded.
#
# Requirements: kramdown auto_ids must be enabled (it is by default),
# since the tag links to the ids kramdown puts on headings.

require "cgi"

module Jekyll
  class TocTag < Liquid::Tag
    HEADING_RE = %r{<h([1-6])[^>]*\bid="([^"]+)"[^>]*>(.*?)</h\1>}m.freeze

    CHEVRON = %(<svg class="toc-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">) +
              %(<path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>)

    def initialize(tag_name, markup, tokens)
      super
      @collapsible = markup.split.include?("collapsible")
    end

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

      @collapsible ? build_sections(headings, min) : build_list(headings)
    end

    private

    # Groups headings into top-level sections (level `min`) with their direct
    # subsections (level `min + 1`); deeper headings are left out. Headings
    # before the first top-level one have no section to sit in and are skipped.
    def build_sections(headings, min)
      sections = []
      headings.each do |h|
        if h[:level] == min
          sections << { heading: h, children: [] }
        elsif h[:level] == min + 1 && sections.any?
          sections.last[:children] << h
        end
      end
      return "" if sections.empty?

      out = +%(<ol class="toc-sections">)
      sections.each_with_index do |section, i|
        h = section[:heading]
        children = section[:children]
        number = i + 1
        sub_id = "toc-sub-#{h[:id]}"

        out << %(\n<li class="toc-section">)
        out << %(<div class="toc-row">)
        out << %(<span class="toc-num">#{number}</span>)
        out << %(<a class="toc-title" href="##{h[:id]}">#{h[:text]}</a>)
        if children.any?
          label = "Show subsections of #{CGI.unescapeHTML(h[:text])}"
          out << %(<button type="button" class="toc-toggle" aria-expanded="true" aria-controls="#{sub_id}" aria-label="#{CGI.escapeHTML(label)}" hidden>)
          out << %(#{CHEVRON}</button>)
        end
        out << %(</div>)
        if children.any?
          out << %(\n<ol class="toc-subsections" id="#{sub_id}">)
          children.each_with_index do |c, j|
            out << %(\n<li><span class="toc-subnum">#{number}.#{j + 1}</span><a href="##{c[:id]}">#{c[:text]}</a></li>)
          end
          out << %(\n</ol>)
        end
        out << %(</li>)
      end
      out << %(\n</ol>)
      out
    end

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
