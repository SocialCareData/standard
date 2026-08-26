document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header')
  if (!header) return

  header.classList.remove('nojs')

  const nav = header.querySelector('.site-nav')
  const hamburgerButton = header.querySelector('.hamburger-menu')
  const items = Array.from(header.querySelectorAll('.nav-item.has-panel'))

  /* Narrow viewports use the hamburger sheet; the breakpoint matches header.css. */
  const isNarrow = () => window.matchMedia('(max-width: 1024px)').matches

  /* Devices that cannot hover (touch) toggle the panel instead of following the
     parent link, since they have no way to reveal it by hovering. */
  const isTouch = () => window.matchMedia('(hover: none)').matches

  const isOpen = item => item.classList.contains('open')

  function setOpen(item, open) {
    item.classList.toggle('open', open)
    item.querySelector('.nav-toggle').setAttribute('aria-expanded', open ? 'true' : 'false')
    item.querySelector('.nav-panel').hidden = !open
  }

  function closeAllPanels(except) {
    items.forEach(function(item) {
      if (item !== except) setOpen(item, false)
    })
  }

  function setSheet(open) {
    nav.classList.toggle('open', open)
    hamburgerButton.classList.toggle('active', open)
    hamburgerButton.setAttribute('aria-expanded', open ? 'true' : 'false')
  }

  /* Desktop: hovering or focusing anything in the bar opens that item's panel and
     closes the rest, so childless items and the home link dismiss an open panel too.
     Delegated, because mouseenter does not bubble. */
  /* Set while Escape hands focus back to a chevron, so that focusin does not
     reopen the panel Escape just closed. */
  let suppressReveal = false

  function reveal(event) {
    /* Touch devices fire a synthetic mouseover before click; revealing here would
       let the click handler immediately toggle the panel back shut. */
    if (isNarrow() || isTouch() || suppressReveal) return

    /* A panel is a descendant of its own .nav-item, so pointing anywhere inside it
       counts as pointing at that item and keeps it open. */
    const item = event.target.closest('.nav-item')
    if (item && item.classList.contains('has-panel')) {
      closeAllPanels(item)
      setOpen(item, true)
      return
    }

    /* Only another nav control dismisses an open panel. The header's own padding
       sits between the bar and the panel below it, and must stay neutral so the
       pointer can travel down into the panel without closing it. */
    if (item || event.target.closest('.home')) closeAllPanels()
  }
  header.addEventListener('mouseover', reveal)
  header.addEventListener('focusin', reveal)

  items.forEach(function(item) {
    const link = item.querySelector('.nav-link')
    const toggle = item.querySelector('.nav-toggle')

    /* Chevron: single panel on desktop, independent accordions when narrow. */
    toggle.addEventListener('click', function() {
      const open = !isOpen(item)
      if (!isNarrow()) closeAllPanels(item)
      setOpen(item, open)
    })

    link.addEventListener('click', function(event) {
      if (isNarrow() || !isTouch()) return
      event.preventDefault()
      const open = !isOpen(item)
      closeAllPanels(item)
      setOpen(item, open)
    })
  })

  header.addEventListener('mouseleave', function() {
    if (!isNarrow()) closeAllPanels()
  })

  /* Focus leaving the header closes any open panel. */
  header.addEventListener('focusout', function(event) {
    if (!isNarrow() && !header.contains(event.relatedTarget)) closeAllPanels()
  })

  document.addEventListener('click', function(event) {
    if (!header.contains(event.target)) closeAllPanels()
  })

  document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return

    if (isNarrow() && nav.classList.contains('open')) {
      setSheet(false)
      hamburgerButton.focus()
      return
    }

    const open = items.filter(isOpen)[0]
    if (open) {
      suppressReveal = true
      setOpen(open, false)
      open.querySelector('.nav-toggle').focus()
      suppressReveal = false
    }
  })

  hamburgerButton.addEventListener('click', function() {
    setSheet(!nav.classList.contains('open'))
  })

  /* Open Pagefind search modal when the search button is clicked */
  const searchButton = header.querySelector('.search-button')
  if (searchButton) {
    searchButton.addEventListener('click', function() {
      const modal = document.querySelector('pagefind-modal')
      if (modal) {
        modal.open()
      }
    })
  }

  /* Handle viewport resize to prevent unwanted menu transitions */
  let resizeTimeout;
  let wasNarrow = isNarrow()
  window.addEventListener('resize', function() {
    /* Add resizing class to disable transitions */
    nav.classList.add('resizing')

    /* Panel state does not carry across the breakpoint. Only reset on an actual
       crossing: mobile browsers fire resize when the URL bar collapses. */
    if (isNarrow() !== wasNarrow) {
      wasNarrow = isNarrow()
      closeAllPanels()
      setSheet(false)
    }

    /* Clear existing timeout */
    clearTimeout(resizeTimeout)

    /* Remove resizing class after resize is complete */
    resizeTimeout = setTimeout(function() {
      nav.classList.remove('resizing')
    }, 100)
  })
})
