# _plugins/internal_links.rb
#
# Shared helpers for finding links to other pages on this site.
#
# Used by:
#   - check_internal_links.rb, which reads hrefs from the built HTML;
#   - related_pages.rb, which runs before rendering and so reads the links
#     straight from each page's Markdown/HTML source.

require "uri"

module Jekyll
  module InternalLinks
    # Links written in page source:
    #   [text](/path)          Markdown inline link
    #   [ref]: /path           Markdown reference definition
    #   href="/path"           raw HTML
    SOURCE_LINK_RES = [
      %r{\]\(\s*(/[^)\s]*)},
      %r{^\s{0,3}\[[^\]]+\]:\s*(/\S*)},
      %r{\bhref\s*=\s*["'](/[^"']*)["']}
    ].freeze

    module_function

    # The path an internal (root-relative) href points to, without query or
    # fragment, or nil when the href is not an internal page link.
    def internal_path(href)
      href = href.to_s.strip
      return nil if href.empty?
      return nil if href.start_with?("#", "mailto:", "tel:")
      return nil unless href.start_with?("/") && !href.start_with?("//")

      URI(href).path
    rescue URI::InvalidURIError
      nil
    end

    # A path in the same form as a Jekyll page url, so that "/foo/",
    # "/foo.html" and "/foo/index.html" all match a page whose url is "/foo".
    def canonical_url(path)
      url = path.to_s.sub(%r{/index\.html\z}, "/").sub(/\.html\z/, "")
      url = url.chomp("/") while url.length > 1 && url.end_with?("/")
      url.empty? ? "/" : url
    end

    # Canonical urls of all internal links found in raw page source.
    def links_in_source(text)
      SOURCE_LINK_RES
        .flat_map { |re| text.to_s.scan(re).flatten }
        .filter_map { |href| internal_path(href) }
        .map { |path| canonical_url(path) }
        .uniq
    end
  end
end
