require 'rouge'

module Jekyll
  class ConcatStylesGenerator < Jekyll::Generator
    priority :lowest

    def generate(site)
      styles = site.config['styles']
      return unless styles && styles['input'] && styles['output']

      input_dir = styles['input'].sub(/^\//, '')
      output_path = styles['output'].sub(/^\//, '')

      # Remove individual CSS source files from output (but keep the concatenated file)
      site.static_files.reject! do |f|
        path = f.relative_path.sub(/^\//, '')
        path.start_with?(input_dir) && path != output_path
      end
    end
  end
end

Jekyll::Hooks.register :site, :post_write, priority: :lowest do |site|
  styles = site.config['styles']
  next unless styles && styles['input'] && styles['output']

  output_path = styles['output'].sub(/^\//, '')

  source_dir = File.join(site.source, styles['input'])
  css_files = Dir.glob(File.join(source_dir, '**', '*.css')).sort

  content = css_files.map { |f| File.read(f) }.join("\n")

  if styles['rouge_theme']
    theme_class = Rouge::Theme.find(styles['rouge_theme']) || Rouge::Themes::Github
    content << "\n" << theme_class.render(scope: '.highlight')
  end

  if styles['minify'] != false
    content = content
      .gsub(/\/\*.*?\*\//m, '')  # remove comments
      .gsub(/\s*\n\s*/, '')      # remove newlines and surrounding whitespace
      .gsub(/\s*([{}:;,>~+])\s*/, '\1') # remove whitespace around symbols
      .strip
  end

  out = File.join(site.dest, output_path)
  FileUtils.mkdir_p(File.dirname(out))
  File.write(out, content)
end
