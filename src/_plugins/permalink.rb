# posts
Jekyll::Hooks.register :posts, :post_init do |post|
  post.data["permalink"] = "/#{post.basename_without_ext}"
end

# pages
Jekyll::Hooks.register :pages, :post_init do |page|
  next unless page.path.start_with?("_pages/")
  if page.basename == "index"
    page.data["permalink"] = "/"
  else
    page.data["permalink"] = "/#{page.basename}"
  end
end
