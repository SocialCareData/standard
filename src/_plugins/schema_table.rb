# _plugins/schema_table.rb
#
# Adds a {% schema_table %} Liquid tag that renders a Markdown table from a
# LinkML data model. If the second argument names a class, the table describes
# its properties; if it names a controlled-vocabulary property (a slot whose
# range is an enum) or an enum, a collapsible "Code" / "Description" vocabulary
# table is rendered instead.
#
# The heavy lifting lives in src/assets/js/schema-table/. This plugin is a thin shim that shells out to it
# and caches the result per (page, file, entity) for the duration of a build.
#
# Because Jekyll processes Liquid BEFORE the Markdown converter (kramdown),
# the Markdown table this tag emits is converted to a real HTML <table> and
# baked into the compiled output in ./dist — so it is present without any
# client-side JavaScript and is indexed by Pagefind.
#
# Usage in a page (place the tag on its own line, at column 0):
#
#   {% schema_table src/assets/model/placements/placements.yaml PlacementAvailability %}
#
# Arguments (whitespace separated, optional surrounding quotes):
#   1. path to the LinkML YAML model, relative to the project root
#   2. a class name, or a controlled-vocabulary property name
#      (e.g. communicationNeeds) or enum name

require "open3"
require "shellwords"

module Jekyll
  class SchemaTableTag < Liquid::Tag
    # CLI entry point, relative to the project root (Dir.pwd during a build).
    CLI = File.join("src", "assets", "js", "schema-table", "index.js").freeze

    # A Markdown heading line, capturing its text (ignoring any closing #s).
    HEADING_RE = /^\s{0,3}\#{1,6}\s+(.+?)\s*#*\s*$/.freeze
    # A fenced code-block delimiter (``` or ~~~), whose contents we skip.
    FENCE_RE = /^\s*(?:```|~~~)/.freeze

    # Cache generated tables for the whole build so the same (page, file,
    # entity) triple only spawns Node once.
    @cache = {}
    class << self
      attr_reader :cache
    end

    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.to_s.strip
    end

    def render(context)
      schema_file, entity = parse_args(@markup)
      unless schema_file && entity
        return error_note("expected two arguments: <schema-file> <entity>, got #{@markup.inspect}")
      end

      schema_file = resolve_value(schema_file, context)
      entity     = resolve_value(entity, context)

      # Tell Jekyll's incremental regenerator that this page depends on the
      # model file. Without this, editing the model never re-renders the page
      # under `jekyll serve --watch --incremental` (Jekyll only tracks .md
      # sources, layouts and includes — not files the tag reads out-of-band).
      register_dependency(context, schema_file)

      headings = page_headings(context)

      # A class table's Options column depends on which taxonomy sections exist
      # on THIS page, so the cache is keyed by page as well as (file, entity).
      # The model file's mtime is part of the key too, so a long-running
      # `--watch` process (which keeps this class — and its cache — in memory
      # across rebuilds) regenerates the table when the model changes rather
      # than serving a stale cached copy.
      page_id = (context.registers[:page] && context.registers[:page]["path"]).to_s
      key = "#{page_id}\t#{schema_file}\t#{entity}\t#{model_mtime(schema_file)}"
      self.class.cache[key] ||= generate(schema_file, entity, headings)
    end

    private

    # Resolves arguments that can be either Liquid variables (e.g. page.data_model)
    # or literal string paths / entity names (quoted or unquoted).
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

    # Register the model file as an incremental-build dependency of the current
    # page, so a change to it forces the page to regenerate. Best-effort: guarded
    # so a missing/renamed Jekyll API never breaks the build.
    def register_dependency(context, schema_file)
      site = context.registers[:site]
      page = context.registers[:page]
      return unless site.respond_to?(:regenerator) && page && page["path"]

      page_path = site.in_source_dir(page["path"])
      dependency = File.expand_path(schema_file)
      site.regenerator.add_dependency(page_path, dependency)
    rescue StandardError => e
      Jekyll.logger.warn("SchemaTable:", "could not register dependency: #{e.message}")
    end

    # Split "path Entity" into two tokens, tolerating surrounding quotes.
    def parse_args(markup)
      parts = Shellwords.split(markup)
      [parts[0], parts[1]]
    rescue ArgumentError
      parts = markup.split(/\s+/)
      [parts[0], parts[1]]
    end

    # The heading texts on the page currently being rendered. The generator
    # uses them to decide whether a taxonomy has a section on this page to link
    # to. Fenced code blocks are skipped so `# comments` inside them are not
    # mistaken for headings.
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

        # Drop any trailing kramdown IAL (e.g. `{: #custom}`); the JS side
        # slugifies the remaining text to match kramdown's auto_id.
        text = m[1].sub(/\s*\{:.*\}\s*$/, "").strip
        headings << text unless text.empty?
      end
      headings
    end

    # Gather the page's raw (pre-kramdown) Markdown from every source we can, so
    # heading detection is robust across Jekyll versions: the page payload's
    # content, and the source file on disk.
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
            # Drop the YAML front matter so its keys/comments are never mistaken
            # for headings.
            parts << File.read(full).sub(/\A---\s*\n.*?\n---\s*\n/m, "")
          end
        end
      rescue StandardError
        # Ignore: a missing/unreadable file just means fewer known headings.
      end

      parts.join("\n")
    end

    def generate(schema_file, entity, headings)
      stdout, stderr, status =
        Open3.capture3("node", CLI, schema_file, entity, "--page-headings", headings.join("\n"))

      unless status.success?
        Jekyll.logger.error("SchemaTable:", "#{schema_file} #{entity} -> #{stderr.strip}")
        return error_note("could not generate table for #{entity} from #{schema_file}: #{stderr.strip}")
      end

      # Non-fatal warnings (e.g. a skipped companion file) go to stderr.
      stderr.strip.split("\n").each { |line| Jekyll.logger.warn("SchemaTable:", line) }

      # Surround with blank lines so kramdown treats it as a standalone block
      # regardless of where the tag sat in the source. The generator already
      # emits any kramdown IAL it needs (e.g. `{: .schema-table}` for a property
      # table, `{: .table-bordered}` for a vocabulary table).
      "\n#{stdout.strip}\n"
    end

    def error_note(message)
      Jekyll.logger.warn("SchemaTable:", message)
      "\n> **Schema table error:** #{message}\n"
    end
  end
end

Liquid::Template.register_tag("schema_table", Jekyll::SchemaTableTag)
