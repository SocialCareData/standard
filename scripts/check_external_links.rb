#!/usr/bin/env ruby
# Walk the built site and verify that every external <a href="http(s)://…">
# returns a successful response. Exits non-zero on any broken link.

require 'find'
require 'nokogiri'
require 'net/http'
require 'uri'

site = ARGV[0] || '_site'
abort "site directory '#{site}' not found" unless File.directory?(site)

USER_AGENT = 'Mozilla/5.0 (compatible; SocialCareData-link-checker/1.0)'
broken = []
seen   = {}

def check(href)
  uri  = URI(href)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl      = (uri.scheme == 'https')
  http.open_timeout = 10
  http.read_timeout = 10

  attempts = 0
  begin
    attempts += 1

    req = Net::HTTP::Head.new(uri.request_uri)
    req['User-Agent'] = USER_AGENT
    res = http.request(req)

    # Some servers don't support HEAD.
    if [405, 501].include?(res.code.to_i)
      req = Net::HTTP::Get.new(uri.request_uri)
      req['User-Agent'] = USER_AGENT
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

Find.find(site) do |path|
  next unless path.end_with?('.html')

  doc = Nokogiri::HTML(File.read(path))
  doc.css('a[href]').each do |a|
    href = a['href'].to_s.strip
    next if href.empty?
    next unless href.start_with?('http://', 'https://')

    err = seen.fetch(href) { seen[href] = check(href) }
    broken << "#{path}: #{href} (#{err})" if err
  end
end

if broken.empty?
  puts 'External link check passed.'
else
  warn "Broken external links (#{broken.size}):"
  broken.each { |b| warn "  #{b}" }
  exit 1
end
