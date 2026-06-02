#!/usr/bin/env ruby
# Walk the built site and verify that every internal <a href="/…"> resolves
# to a file (or directory index) on disk. Exits non-zero on any broken link.

require 'find'
require 'nokogiri'
require 'uri'

site = ARGV[0] || '_site'
abort "site directory '#{site}' not found" unless File.directory?(site)

broken = []

Find.find(site) do |path|
  next unless path.end_with?('.html')

  doc = Nokogiri::HTML(File.read(path))
  doc.css('a[href]').each do |a|
    href = a['href'].to_s.strip
    next if href.empty?
    next if href.start_with?('#', 'mailto:', 'tel:')
    next unless href.start_with?('/')

    target = URI(href).path
    candidates = [
      File.join(site, target),
      File.join(site, target, 'index.html'),
      File.join(site, "#{target}.html")
    ]
    next if candidates.any? { |c| File.file?(c) }

    broken << "#{path}: #{href}"
  end
end

if broken.empty?
  puts 'Link check passed.'
else
  warn "Broken internal links (#{broken.size}):"
  broken.each { |b| warn "  #{b}" }
  exit 1
end
