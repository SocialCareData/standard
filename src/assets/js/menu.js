document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header')
  if (!header) return

  header.classList.remove('nojs')

  const nav = header.querySelector('.site-nav')
  const hamburgerButton = header.querySelector('.hamburger-menu')
  const items = Array.from(header.querySelectorAll('.nav-item.has-panel'))

  // Breakpoint matches header.css: narrow viewports use the hamburger sheet.
  const isNarrow = () => window.matchMedia('(max-width: 1024px)').matches
  // Touch devices toggle panels on tap since they cannot hover to reveal them.
  const isTouch = () => window.matchMedia('(hover: none)').matches

  const isOpen = item => item.classList.contains('open')
  const isSheetOpen = () => nav.classList.contains('open')

  function setOpen(item, open) {
    item.classList.toggle('open', open)
    item.querySelector('.nav-toggle').setAttribute('aria-expanded', open ? 'true' : 'false')
    item.querySelector('.nav-panel').hidden = !open
  }

  function closeAllPanels(except) {
    items.forEach(item => { if (item !== except) setOpen(item, false) })
  }

  function setSheet(open) {
    nav.classList.toggle('open', open)
    hamburgerButton.classList.toggle('active', open)
    hamburgerButton.setAttribute('aria-expanded', open ? 'true' : 'false')
  }

  /* Set while Escape hands focus back to a chevron, so that focusin does not
     reopen the panel Escape just closed. */
  let suppressReveal = false

  // Item just closed by a click; stays closed while the pointer rests on it so a
  // stray mousemove does not hover it back open.
  let dismissed = null

  // Focus following a mousedown is pointer-driven; only keyboard focus should open
  // a panel (a click would flash it open before navigating), so ignore focusin
  // while the pointer is pressing.
  let pointerFocus = false
  header.addEventListener('mousedown', function() { pointerFocus = true })
  window.addEventListener('mouseup', function() { pointerFocus = false })

  // Desktop: hovering or keyboard-focusing an item opens its panel and closes the
  // rest. Delegated because mouseenter does not bubble.
  function reveal(event) {
    if (isNarrow() || isTouch() || suppressReveal) return
    if (event.type === 'focusin' && pointerFocus) return

    /* A panel is a descendant of its own .nav-item, so pointing anywhere inside it
       counts as pointing at that item and keeps it open. */
    const item = event.target.closest('.nav-item')
    if (item !== dismissed) dismissed = null

    if (item && item.classList.contains('has-panel')) {
      closeAllPanels(item)
      if (item !== dismissed) setOpen(item, true)
      return
    }

    /* Only another nav control dismisses an open panel. */
    if (item || event.target.closest('.home')) closeAllPanels()
  }
  header.addEventListener('mouseover', reveal)
  header.addEventListener('focusin', reveal)

  // A parent with a panel is a disclosure control, not a link: clicking its label
  // or chevron toggles the panel instead of navigating (its own page sits inside
  // the panel). Desktop keeps one panel open; narrow screens allow several.
  function toggleItem(item) {
    const open = !isOpen(item)
    if (!isNarrow()) closeAllPanels(item)
    setOpen(item, open)
    dismissed = open ? null : item
  }

  items.forEach(function(item) {
    item.querySelector('.nav-toggle').addEventListener('click', () => toggleItem(item))
    item.querySelector('.nav-link').addEventListener('click', function(event) {
      event.preventDefault()
      toggleItem(item)
    })
  })

  header.addEventListener('mouseleave', function() {
    if (isNarrow()) return
    dismissed = null
    closeAllPanels()
  })

  /* Focus leaving the header closes any open panel. */
  header.addEventListener('focusout', function(event) {
    if (!isNarrow() && !header.contains(event.relatedTarget)) closeAllPanels()
  })

  // Clicking outside the header closes any open panel.
  document.addEventListener('click', function(event) {
    if (!header.contains(event.target)) closeAllPanels()
  })

  // Escape closes the sheet (narrow) or the open panel (desktop), returning focus
  // to the control that owns it.
  document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return

    if (isNarrow() && isSheetOpen()) {
      setSheet(false)
      hamburgerButton.focus()
      return
    }

    const open = items.find(isOpen)
    if (open) {
      suppressReveal = true
      setOpen(open, false)
      open.querySelector('.nav-toggle').focus()
      suppressReveal = false
    }
  })

  hamburgerButton.addEventListener('click', () => setSheet(!isSheetOpen()))

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

  // Disable transitions while resizing, and reset menu state only when the layout
  // actually crosses the breakpoint (mobile URL-bar collapse also fires resize).
  let resizeTimeout
  let wasNarrow = isNarrow()
  window.addEventListener('resize', function() {
    nav.classList.add('resizing')

    if (isNarrow() !== wasNarrow) {
      wasNarrow = isNarrow()
      closeAllPanels()
      setSheet(false)
    }

    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => nav.classList.remove('resizing'), 100)
  })
})
