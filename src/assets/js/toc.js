document.addEventListener('DOMContentLoaded', function() {
  const toc = document.querySelector('.toc-collapsible')
  if (!toc) return

  // Only sections with subsections have a toggle; the rest are plain rows.
  const sections = Array.from(toc.querySelectorAll('.toc-section'))
    .filter(section => section.querySelector('.toc-toggle'))
  if (sections.length === 0) return

  function setOpen(section, open) {
    section.classList.toggle('open', open)
    section.querySelector('.toc-toggle').setAttribute('aria-expanded', open ? 'true' : 'false')
    section.querySelector('.toc-subsections').hidden = !open
  }

  const isOpen = section => section.classList.contains('open')

  /* The section that contains the element the URL hash points at: the last
     top-level heading at or before it in the document. The target may be a
     subsection heading or something deeper, like a property's <span id>. */
  function sectionForHash() {
    const id = decodeURIComponent(window.location.hash.slice(1))
    const target = id && document.getElementById(id)
    if (!target || toc.contains(target)) return null

    let found = null
    sections.forEach(section => {
      const heading = document.getElementById(section.querySelector('.toc-title').hash.slice(1))
      if (heading && (heading === target ||
          heading.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        found = section
      }
    })
    return found
  }

  function revealHashSection() {
    const section = sectionForHash()
    if (section) setOpen(section, true)
  }

  // Progressive enhancement: the buttons ship hidden and every section expanded.
  sections.forEach(section => {
    const toggle = section.querySelector('.toc-toggle')
    toggle.hidden = false
    setOpen(section, false)
    toggle.addEventListener('click', function() {
      setOpen(section, !isOpen(section))
    })
  })

  revealHashSection()
  window.addEventListener('hashchange', revealHashSection)
})
