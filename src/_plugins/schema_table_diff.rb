# _plugins/schema_table_diff.rb
#
# Adds a {% schema_table_diff %} Liquid tag that renders a table showing how a
# LinkML data model changed between two versions. It is the diff counterpart of
# {% schema_table %} (src/_plugins/schema_table.rb): same class / controlled-
# vocabulary resolution, but it compares a "current" model against a "previous"
# one and marks up the differences — added (green text), removed (red, struck
# through) and changed (old value struck through beside the new).
#
# The heavy lifting lives in src/assets/js/schema-table/ (invoked with
# --previous). This plugin is a thin shim that shells out to it and caches the
# result per (page, current, previous, entity) for the duration of a build.
#
# Like {% schema_table %}, the generator emits a Markdown table (kramdown builds
# the <table>); the diff colours ride along as inline HTML inside the cells.
# Markdown cannot class a <td>/<tr>, so only the text is coloured, not the cell
# background.
#
# Usage in a page (place the tag on its own line, at column 0):
#
#   {% schema_table_diff current previous PlacementAvailability %}
#
# Arguments (whitespace separated, optional surrounding quotes):
#   1. path to the current LinkML YAML model (or a variable holding it)
#   2. path to the previous LinkML YAML model (or a variable holding it)
#   3. a class name, or a controlled-vocabulary property name / enum name

require "open3"
require "shellwords"

module Jekyll
  class SchemaTableDiffTag < Liquid::Tag
    # CLI entry point, relative to the project root (Dir.pwd during a build).
    CLI = File.join("src", "assets", "js", "schema-table", "index.js").freeze

    # A Markdown heading line, capturing its text (ignoring any closing #s).
    HEADING_RE = /^\s{0,3}\#{1,6}\s+(.+?)\s*#*\s*$/.freeze
    # A fenced code-block delimiter (``` or ~~~), whose contents we skip.
    FENCE_RE = /^\s*(?:```|~~~)/.freeze

    # Cache generated tables for the whole build so the same (page, current,
    # previous, entity) tuple only spawns Node once.
    @cache = {}
    class << self
      attr_reader :cache
    end

    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.to_s.strip
    end

    def render(context)
      current, previous, entity = parse_args(@markup)
      unless current && previous && entity
        return error_note("expected three arguments: <current> <previous> <entity>, got #{@markup.inspect}")
      end

      current  = resolve_value(current, context)
      previous = resolve_value(previous, context)
      entity   = resolve_value(entity, context)

      # Tell Jekyll's incremental regenerator that this page depends on BOTH model
      # files, so editing either one re-renders the page under `--watch`.
      register_dependency(context, current)
      register_dependency(context, previous)

      headings = page_headings(context)

      # A class table's Options column depends on which taxonomy sections exist on
      # THIS page, so the cache is keyed by page as well. Both files' mtimes are
      # part of the key so a long-running `--watch` process regenerates when
      # either model changes rather than serving a stale cached copy.
      page_id = (context.registers[:page] && context.registers[:page]["path"]).to_s
      key = "#{page_id}\t#{current}\t#{previous}\t#{entity}\t#{model_mtime(current)}\t#{model_mtime(previous)}"
      self.class.cache[key] ||= generate(current, previous, entity, headings)
    end

    private

    # Resolves arguments that can be either Liquid variables (e.g. page.data_model
    # or an {% assign %}ed variable) or literal string paths / entity names.
    def resolve_value(arg, context)
      return nil if arg.nil?

      clean_arg = arg.strip

      # 1. If wrapped in quotes, treat as a literal string and strip quotes
      if (clean_arg.start_with?('"') && clean_arg.end_with?('"')) ||
         (clean_arg.start_with?("'") && clean_arg.end_with?("'"))
        return clean_arg[1..-2]
      end

      # 2. Look up the variable in Liquid's context
      resolved = begin
        context[clean_arg]
      rescue StandardError
        nil
      end

      # 3. Use the resolved variable if found; otherwise, fall back to the raw string
      if resolved.nil? || (resolved.is_a?(String) && resolved.empty?)
        clean_arg
      else
        resolved.to_s
      end
    end

    # Absolute-path mtime (as an integer) of the model file, or 0 if missing.
    def model_mtime(schema_file)
      File.exist?(schema_file) ? File.mtime(schema_file).to_i : 0
    rescue StandardError
      0
    end

    # Register a model file as an incremental-build dependency of the current
    # page. Best-effort: guarded so a missing/renamed Jekyll API never breaks the
    # build.
    def register_dependency(context, schema_file)
      site = context.registers[:site]
      page = context.registers[:page]
      return unless site.respond_to?(:regenerator) && page && page["path"]

      page_path = site.in_source_dir(page["path"])
      dependency = File.expand_path(schema_file)
      site.regenerator.add_dependency(page_path, dependency)
    rescue StandardError => e
      Jekyll.logger.warn("SchemaTableDiff:", "could not register dependency: #{e.message}")
    end

    # Split "current previous Entity" into three tokens, tolerating quotes.
    def parse_args(markup)
      parts = Shellwords.split(markup)
      [parts[0], parts[1], parts[2]]
    rescue ArgumentError
      parts = markup.split(/\s+/)
      [parts[0], parts[1], parts[2]]
    end

    # The heading texts on the page currently being rendered. The generator uses
    # them to decide whether a taxonomy has a section on this page to link to.
    # Fenced code blocks are skipped so `# comments` inside them are not mistaken
    # for headings.
    def page_headings(context)
      markdown = page_markdown(context)
      return [] if markdown.empty?

      headings = []
      in_fence = false
      markdown.each_line do |line|
        if line =~ FENCE_RE
          in_fence = !in_fence
          next
        end
        next if in_fence
        next unless (m = line.match(HEADING_RE))

        text = m[1].sub(/\s*\{:.*\}\s*$/, "").strip
        headings << text unless text.empty?
      end
      headings
    end

    # Gather the page's raw (pre-kramdown) Markdown from every source we can, so
    # heading detection is robust across Jekyll versions.
    def page_markdown(context)
      parts = []

      begin
        page = context["page"]
        content = page && page["content"]
        parts << content if content.is_a?(String) && !content.empty?
      rescue StandardError
        # Ignore: fall back to reading the file below.
      end

      begin
        site = context.registers[:site]
        path = context.registers[:page] && context.registers[:page]["path"]
        if site && path
          full = File.expand_path(File.join(site.source, path))
          if File.file?(full)
            parts << File.read(full).sub(/\A---\s*\n.*?\n---\s*\n/m, "")
          end
        end
      rescue StandardError
        # Ignore: a missing/unreadable file just means fewer known headings.
      end

      parts.join("\n")
    end

    def generate(current, previous, entity, headings)
      stdout, stderr, status =
        Open3.capture3(
          "node", CLI, current, entity,
          "--previous", previous,
          "--page-headings", headings.join("\n")
        )

      unless status.success?
        Jekyll.logger.error("SchemaTableDiff:", "#{current} vs #{previous} #{entity} -> #{stderr.strip}")
        return error_note("could not generate diff table for #{entity} (#{current} vs #{previous}): #{stderr.strip}")
      end

      # Non-fatal warnings go to stderr.
      stderr.strip.split("\n").each { |line| Jekyll.logger.warn("SchemaTableDiff:", line) unless line.empty? }

      # Surround with blank lines so kramdown treats the HTML block as standalone
      # regardless of where the tag sat in the source. The block itself carries
      # markdown="0" so its contents are not re-parsed.
      "\n#{stdout.strip}\n"
    end

    def error_note(message)
      Jekyll.logger.warn("SchemaTableDiff:", message)
      "\n> **Schema table diff error:** #{message}\n"
    end
  end
end

Liquid::Template.register_tag("schema_table_diff", Jekyll::SchemaTableDiffTag)
