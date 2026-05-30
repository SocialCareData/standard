Jekyll::Hooks.register :site, :post_write do |site|
  if site.config["pagefind"]
    pagefind = system("pagefind", "--site", site.dest)
    if pagefind
      pagefind_css = File.join(site.dest, "pagefind", "pagefind-component-ui.css")
      concat = site.static_files.find { |f| f.is_a?(Jekyll::ConcatStyles) }
      if concat && File.exist?(pagefind_css)
        File.write(concat.output_path(site.dest), concat.build_content([pagefind_css]))
      end
    else
      Jekyll.logger.warn("Pagefind:", "indexing failed")
    end
  end
end
