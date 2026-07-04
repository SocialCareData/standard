Jekyll::Hooks.register :site, :post_write do |site|
  next unless site.config['check_internal_links']

  require 'find'
  require 'nokogiri'
  require 'uri'

  dest       = site.dest
  broken     = []
  absolute   = []
  site_url   = site.config['url'].to_s.strip
  site_host  = site_url.empty? ? nil : URI(site_url).host

  Find.find(dest) do |path|
    next unless path.end_with?('.html')

    doc = Nokogiri::HTML(File.read(path))
    doc.css('a[href]').each do |a|
      href = a['href'].to_s.strip
      next if href.empty?
      next if href.start_with?('#', 'mailto:', 'tel:')

      # Flag internal links written as absolute URLs to the site's own host;
      # these should be relative instead.
      if site_host && href.start_with?('http://', 'https://') && URI(href).host == site_host
        absolute << "#{path}: #{href}"
        next
      end

      next unless href.start_with?('/')

      target     = URI(href).path
      candidates = [
        File.join(dest, target),
        File.join(dest, target, 'index.html'),
        File.join(dest, "#{target}.html")
      ]
      next if candidates.any? { |c| File.file?(c) }

      broken << "#{path}: #{href}"
    end
  end

  if broken.empty?
    Jekyll.logger.info('Internal links:', 'check passed.')
  else
    Jekyll.logger.error('Internal links:', "#{broken.size} broken link(s):")
    broken.each { |b| Jekyll.logger.error('', "  #{b}") }
  end

  unless absolute.empty?
    Jekyll.logger.error('Internal links:', "#{absolute.size} absolute internal link(s) (should be relative):")
    absolute.each { |b| Jekyll.logger.error('', "  #{b}") }
  end

  exit 1 unless broken.empty? && absolute.empty?
end
