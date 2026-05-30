document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.header').classList.remove('nojs')
  const hamburgerButton = document.querySelector('.hamburger-menu')
  const nav = document.querySelector('.header .nav')

  hamburgerButton.addEventListener('click', function() {
    const isOpen = nav.classList.toggle('open')
    hamburgerButton.classList.toggle('active')
    hamburgerButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
  })

  /* Close menu when clicking on a link */
  const navLinks = document.querySelectorAll('.header .nav a')
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      nav.classList.remove('open')
      hamburgerButton.classList.remove('active')
      hamburgerButton.setAttribute('aria-expanded', 'false')
    })
  })

  /* Open Pagefind search modal when the search button is clicked */
  const searchButton = document.querySelector('.header .search-button')
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
  window.addEventListener('resize', function() {
    /* Add resizing class to disable transitions */
    nav.classList.add('resizing')

    /* Clear existing timeout */
    clearTimeout(resizeTimeout)

    /* Remove resizing class after resize is complete */
    resizeTimeout = setTimeout(function() {
      nav.classList.remove('resizing')
    }, 100)
  })
})
