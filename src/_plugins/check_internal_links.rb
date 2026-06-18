Jekyll::Hooks.register :site, :post_write do |site|
  next unless site.config['check_internal_links']

  require 'find'
  require 'nokogiri'
  require 'uri'

  dest   = site.dest
  broken = []

  Find.find(dest) do |path|
    next unless path.end_with?('.html')

    doc = Nokogiri::HTML(File.read(path))
    doc.css('a[href]').each do |a|
      href = a['href'].to_s.strip
      next if href.empty?
      next if href.start_with?('#', 'mailto:', 'tel:')
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
    exit 1
  end
end
