Jekyll::Hooks.register :site, :post_write do |site|
  if site.config["pagefind"]
    pagefind = system("pagefind", "--site", site.dest)
    if pagefind
      styles = site.config["styles"]
      if styles && styles["output"]
        styles_output = File.join(site.dest, styles["output"].sub(/^\//, ''))
        pagefind_css = File.join(site.dest, "pagefind", "pagefind-component-ui.css")
        if File.exist?(styles_output) && File.exist?(pagefind_css)
          File.open(styles_output, "a") do |f|
            f.write("\n")
            f.write(File.read(pagefind_css))
          end
        end
      end
    else
      Jekyll.logger.warn("Pagefind:", "indexing failed")
    end
  end
end
