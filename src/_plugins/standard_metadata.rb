# _plugins/standard_metadata.rb
#
# Derives the values shown in the "About this version" block of a standard
# page (_includes/standard_metadata.html) so the layout only has to print them.
# Runs for every page with both a `reference` (e.g. PUB00) and a `data_model`,
# and sets:
#
#   model_version         `version` of the LinkML model named by `data_model`
#   latest_url            url of the page with the same `reference` whose
#                         file name has no -vN suffix (PUB00-placements-standard.md
#                         rather than PUB00-placements-standard-v1.md)
#   previous_version_url  `previous_spec` of the diff page named by `data_model_diff`
#
# Liquid can neither read YAML files nor match a regex, hence a plugin.

require "yaml"

module Jekyll
  class StandardMetadataGenerator < Generator
    priority :high

    VERSION_SUFFIX_RE = /-v\d+\z/.freeze

    def generate(site)
      standards = site.pages.select { |p| p.data["reference"] && p.data["data_model"] }
      latest = standards
        .reject { |p| p.basename.match?(VERSION_SUFFIX_RE) }
        .each_with_object({}) { |p, h| h[p.data["reference"]] ||= p.url }

      standards.each do |page|
        page.data["model_version"] ||= model_version(site, page.data["data_model"])
        page.data["latest_url"] ||= latest[page.data["reference"]]

        diff_url = page.data["data_model_diff"]
        next unless diff_url

        diff = site.pages.find { |p| p.url == diff_url }
        if diff && diff.data["previous_spec"]
          page.data["previous_version_url"] ||= diff.data["previous_spec"]
        else
          Jekyll.logger.warn("StandardMetadata:", "#{page.path}: no page with previous_spec at #{diff_url}")
        end
      end
    end

    private

    # data_model paths are relative to the project root (the parent of `source`),
    # as they are for {% schema_table %}.
    def model_version(site, data_model)
      return nil if data_model.nil? || data_model.to_s.strip.empty?

      file = File.expand_path(data_model, File.dirname(site.source))
      version = YAML.safe_load(File.read(file))["version"]
      version&.to_s
    rescue StandardError => e
      Jekyll.logger.warn("StandardMetadata:", "could not read version from #{data_model}: #{e.message}")
      nil
    end
  end
end
