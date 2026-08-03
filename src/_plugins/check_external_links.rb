Jekyll::Hooks.register :site, :post_write do |site|
  next unless site.config['check_external_links']
  next if site.config['watch']

  require 'find'
  require 'nokogiri'
  require 'net/http'
  require 'uri'

  dest       = site.dest
  user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  broken     = []
  seen       = {}

  set_headers = lambda do |req|
    req['User-Agent']      = user_agent
    req['Accept']          = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    req['Accept-Language'] = 'en-GB,en;q=0.9'
    req['Accept-Encoding'] = 'gzip, deflate, br'
  end

  # Use a stable cache key so links that only differ by fragment are checked once.
  normalize_href = lambda do |href|
    uri = URI(href)
    uri.fragment = nil
    uri.to_s
  rescue StandardError
    href
  end

  check = lambda do |href|
    uri  = URI(href)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl      = (uri.scheme == 'https')
    http.open_timeout = 10
    http.read_timeout = 10

    attempts = 0
    loop do
      begin
        attempts += 1

        req = Net::HTTP::Head.new(uri.request_uri)
        set_headers.call(req)
        res = http.request(req)

        code = res.code.to_i

        # Some servers don't handle HEAD correctly (e.g. returning 404/405/501
        # for URLs that are valid via GET), so fall back to GET only on codes
        # that are commonly caused by unsupported HEAD requests.
        if [404, 405, 501].include?(code)
          req = Net::HTTP::Get.new(uri.request_uri)
          set_headers.call(req)
          res = http.request(req)
          code = res.code.to_i
        end

        # If a host is rate-limiting us, do one short retry. Persistent 429 is
        # treated as success to avoid flaky CI from third-party throttling.
        if code == 429
          if attempts < 2
            sleep 0.35
            next
          end
          return nil
        end

        return nil if (code >= 200 && code < 400) || code == 403
        return "HTTP #{code}"
      rescue Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET, EOFError => e
        next if attempts < 3
        return "#{e.class}: #{e.message}"
      rescue StandardError => e
        return "#{e.class}: #{e.message}"
      end
    end
  end

  Find.find(dest) do |path|
    next unless path.end_with?('.html')

    doc = Nokogiri::HTML(File.read(path))
    doc.css('a[href]').each do |a|
      href = a['href'].to_s.strip
      next if href.empty?
      next unless href.start_with?('http://', 'https://')

      key = normalize_href.call(href)
      err = seen.fetch(key) { seen[key] = check.call(key) }
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
