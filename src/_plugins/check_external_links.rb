Jekyll::Hooks.register :site, :post_write do |site|
  next unless site.config['check_external_links']

  require 'find'
  require 'nokogiri'
  require 'net/http'
  require 'uri'

  dest       = site.dest
  user_agent = 'Mozilla/5.0 (compatible; SocialCareData-link-checker/1.0)'
  broken     = []
  seen       = {}

  check = lambda do |href|
    uri  = URI(href)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl      = (uri.scheme == 'https')
    http.open_timeout = 10
    http.read_timeout = 10

    attempts = 0
    begin
      attempts += 1

      req = Net::HTTP::Head.new(uri.request_uri)
      req['User-Agent'] = user_agent
      res = http.request(req)

      # Some servers don't support HEAD.
      if [405, 501].include?(res.code.to_i)
        req = Net::HTTP::Get.new(uri.request_uri)
        req['User-Agent'] = user_agent
        res = http.request(req)
      end

      code = res.code.to_i
      return nil if code >= 200 && code < 400
      "HTTP #{code}"
    rescue Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET, EOFError => e
      retry if attempts < 3
      "#{e.class}: #{e.message}"
    rescue StandardError => e
      "#{e.class}: #{e.message}"
    end
  end

  Find.find(dest) do |path|
    next unless path.end_with?('.html')

    doc = Nokogiri::HTML(File.read(path))
    doc.css('a[href]').each do |a|
      href = a['href'].to_s.strip
      next if href.empty?
      next unless href.start_with?('http://', 'https://')

      err = seen.fetch(href) { seen[href] = check.call(href) }
      broken << "#{path}: #{href} (#{err})" if err
    end
  end

  if broken.empty?
    Jekyll.logger.info('External links:', 'check passed.')
  else
    Jekyll.logger.error('External links:', "#{broken.size} broken link(s):")
    broken.each { |b| Jekyll.logger.error('', "  #{b}") }
    exit 1
  end
end
