require "set"

module Jekyll
  # A page generated for a single breadcrumb.
  class BreadcrumbPage < Page
    def initialize(site, base, breadcrumb_title, pages, breadcrumbs = [{ "title" => "Breadcrumbs" }])
      @site = site
      @base = base
      @dir = ""
      @name = "#{BreadcrumbPage.slugify(breadcrumb_title)}.html"

      process(@name)

      self.data = {
        "layout" => "breadcrumb",
        "title"  => breadcrumb_title,
        "breadcrumbs" => breadcrumbs,
        "pages"  => pages.sort_by { |p| p.data["title"].to_s },
        "permalink" => "/#{BreadcrumbPage.slugify(breadcrumb_title)}"
      }
    end

    # Lowercase, replace spaces with underscores, strip other special chars.
    def self.slugify(title)
      title
        .downcase
        .gsub(/\s+/, "_")
        .gsub(/[^a-z0-9_]/, "")
    end
  end

  class BreadcrumbPageGenerator < Generator
    safe true

    def generate(site)
      breadcrumbs = Hash.new { |hash, key| hash[key] = [] }

      site.pages.each do |page|
        Array(page.data["breadcrumbs"]).each do |breadcrumb|
          title = breadcrumb.is_a?(Hash) ? breadcrumb["title"] : breadcrumb
          next if title.nil? || title.to_s.strip.empty?

          breadcrumbs[title.to_s] << page
        end
      end

      existing_permalinks = site.pages.map { |page| page.data["permalink"] }.compact.to_set

      breadcrumb_pages = breadcrumbs.map do |title, pages|
        BreadcrumbPage.new(site, site.source, title, pages)
      end

      breadcrumb_pages.each do |page|
        next if existing_permalinks.include?(page.data["permalink"])

        site.pages << page
      end

      # Extra index page listing all breadcrumb pages (excluding itself).
      index_page = BreadcrumbPage.new(site, site.source, "Breadcrumbs", breadcrumb_pages, [])
      site.pages << index_page
    end
  end
end
