# Publishes the browser build of the <data-standard-validator> web component
# (the npm package @theodi/data-standard-validator-component) at
# /assets/js/data-standard-validator/, where the /validator page imports it.
# The component loads worker.js relative to its own URL, so the two files are
# served side by side.
#
# The release is set in _config.yml:
#
#   validator_component:
#     version: 1.0.0
#
# At build time that version's tarball is downloaded from the npm registry,
# checked against the registry's integrity hash, and its standalone/ files are
# unpacked into the Jekyll cache directory, so later builds reuse them without
# going back to the network.

require "digest"
require "fileutils"
require "json"
require "net/http"
require "rubygems/package"
require "stringio"
require "zlib"

module Jekyll
  module ValidatorComponent
    PACKAGE = "@theodi/data-standard-validator-component".freeze
    REGISTRY = "https://registry.npmjs.org".freeze
    FILES = %w[data-standard-validator.js worker.js].freeze
    DEST_DIR = "/assets/js/data-standard-validator".freeze

    # A static file whose source lives outside the site source (in the cache).
    class PackageFile < StaticFile
      def initialize(site, source_path, dir, name)
        @source_path = source_path
        super(site, site.source, dir, name)
      end

      def path
        @source_path
      end
    end

    class Generator < Jekyll::Generator
      safe true
      priority :low

      def generate(site)
        version = site.config.dig("validator_component", "version").to_s
        raise Errors::FatalException, "ValidatorComponent: set validator_component.version in _config.yml" if version.empty?

        dir = File.join(site.cache_dir, "ValidatorComponent", version)
        fetch(version, dir) unless FILES.all? { |name| File.file?(File.join(dir, name)) }

        FILES.each do |name|
          site.static_files << PackageFile.new(site, File.join(dir, name), DEST_DIR, name)
        end
      end

      private

      def fetch(version, dir)
        Jekyll.logger.info "ValidatorComponent:", "downloading #{PACKAGE}@#{version}"
        meta = JSON.parse(get("#{REGISTRY}/#{PACKAGE}/#{version}"))
        tarball = get(meta.dig("dist", "tarball"))
        verify(tarball, meta.dig("dist", "integrity"))

        files = {}
        Gem::Package::TarReader.new(Zlib::GzipReader.new(StringIO.new(tarball))) do |tar|
          tar.each do |entry|
            name = entry.full_name.delete_prefix("package/standalone/")
            files[name] = entry.read if FILES.include?(name)
          end
        end
        missing = FILES - files.keys
        raise Errors::FatalException, "ValidatorComponent: #{PACKAGE}@#{version} has no standalone/#{missing.join(', ')}" if missing.any?

        FileUtils.mkdir_p(dir)
        files.each { |name, body| File.binwrite(File.join(dir, name), body) }
      end

      def get(url)
        response = Net::HTTP.get_response(URI(url))
        return response.body if response.is_a?(Net::HTTPSuccess)

        raise Errors::FatalException, "ValidatorComponent: GET #{url} returned #{response.code}"
      end

      # npm's dist.integrity is a Subresource Integrity string, "sha512-<base64>".
      def verify(body, integrity)
        algorithm, expected = integrity.to_s.split("-", 2)
        actual = algorithm == "sha512" && [Digest::SHA512.digest(body)].pack("m0")
        return if actual == expected

        raise Errors::FatalException, "ValidatorComponent: #{PACKAGE} tarball failed its integrity check"
      end
    end
  end
end
