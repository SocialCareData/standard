Jekyll::Hooks.register :site, :post_write do |site|
  next unless site.config['check_insecure_links']

  require 'find'
  require 'nokogiri'

  dest    = site.dest
  insecure = []

  Find.find(dest) do |path|
    next unless path.end_with?('.html')

    doc = Nokogiri::HTML(File.read(path))
    doc.css('a[href]').each do |a|
      href = a['href'].to_s.strip
      insecure << "#{path}: #{href}" if href.start_with?('http://')
    end
  end

  if insecure.empty?
    Jekyll.logger.info('Insecure links:', 'check passed.')
  else
    Jekyll.logger.error('Insecure links:', "#{insecure.size} insecure http link(s):")
    insecure.each { |b| Jekyll.logger.error('', "  #{b}") }
    exit 1
  end
end
