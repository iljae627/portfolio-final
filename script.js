document.addEventListener('DOMContentLoaded', () => {
  const body = document.body
  const cursor = document.querySelector('.cursor')
  const progress = document.querySelector('.scroll-progress')
  const nav = document.querySelector('.nav-container')
  const navToggle = document.querySelector('.nav-toggle')
  const observer = createRevealObserver()

  body.classList.add('loaded')
  setupCursor(cursor)
  setupNavigation(nav, navToggle)
  setupScrollProgress(progress)
  setupProjects(observer)
  setupCounters(observer)
  setupEmailCopy()

  document
    .querySelectorAll('.reveal-text')
    .forEach((element) => observer.observe(element))
})

function setupCursor(cursor) {
  if (!cursor) return

  let mouseX = window.innerWidth / 2
  let mouseY = window.innerHeight / 2
  let cursorX = mouseX
  let cursorY = mouseY

  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX
    mouseY = event.clientY
  })

  const moveCursor = () => {
    cursorX += (mouseX - cursorX) * 0.22
    cursorY += (mouseY - cursorY) * 0.22
    cursor.style.left = `${cursorX}px`
    cursor.style.top = `${cursorY}px`
    requestAnimationFrame(moveCursor)
  }

  moveCursor()

  document
    .querySelectorAll('a, button, .project-card, .work-item')
    .forEach((element) => {
      element.addEventListener('mouseenter', () => cursor.classList.add('is-active'))
      element.addEventListener('mouseleave', () => cursor.classList.remove('is-active'))
    })
}

function setupNavigation(nav, navToggle) {
  if (!nav || !navToggle) return

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('menu-open')
    navToggle.setAttribute('aria-expanded', String(isOpen))
    navToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기')
  })

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('menu-open')
      navToggle.setAttribute('aria-expanded', 'false')
    })
  })
}

function setupScrollProgress(progress) {
  if (!progress) return

  const updateProgress = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
    const progressWidth = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0
    progress.style.width = `${Math.min(progressWidth, 100)}%`
  }

  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
}

function setupProjects(observer) {
  if (typeof projects === 'undefined') return

  renderFeaturedProjects(observer)
  renderWorkProjects(observer)
  setupProjectFilters()
}

function renderFeaturedProjects(observer) {
  const featuredList = document.getElementById('featured-list')
  if (!featuredList) return

  featuredList.innerHTML = projects
    .filter((project) => project.featured)
    .map((project) => createProjectCard(project))
    .join('')

  featuredList
    .querySelectorAll('.reveal-text')
    .forEach((element) => observer.observe(element))
}

function renderWorkProjects(observer) {
  const workList = document.getElementById('work-list')
  if (!workList) return

  workList.innerHTML = projects.map((project) => createWorkItem(project)).join('')

  workList
    .querySelectorAll('.reveal-text')
    .forEach((element) => observer.observe(element))
}

function setupProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-button')
  const workItems = document.querySelectorAll('.work-item')
  if (!filterButtons.length || !workItems.length) return

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter

      filterButtons.forEach((item) => item.classList.remove('active'))
      button.classList.add('active')

      workItems.forEach((item) => {
        const shouldShow = filter === 'all' || item.dataset.category === filter
        item.classList.toggle('is-hidden', !shouldShow)
      })
    })
  })
}

function createProjectCard(project) {
  return `
    <article class="project-card reveal-text">
      <a href="${project.link}" ${externalAttributes(project.link)}>
        <div class="project-meta">
          <span class="tag">${project.year}</span>
          <span class="tag">${project.category}</span>
        </div>
        <h2>${project.title}</h2>
        <p>${project.summary}</p>
      </a>
    </article>
  `
}

function createWorkItem(project) {
  const tags = project.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')

  return `
    <article class="work-item reveal-text" data-category="${project.category}">
      <a href="${project.link}" ${externalAttributes(project.link)}>
        <div class="work-meta">${tags}</div>
        <h2>${project.title}</h2>
        <p>${project.summary}</p>
        <div class="work-footer">
          <span class="work-year">${project.year}</span>
          <span>${project.role}</span>
        </div>
      </a>
    </article>
  `
}

function externalAttributes(link) {
  return link.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''
}

function setupCounters(observer) {
  const counters = document.querySelectorAll('[data-count]')
  if (!counters.length) return

  counters.forEach((counter) => {
    observer.observe(counter)
    counter.addEventListener('reveal', () => animateCounter(counter), { once: true })
  })
}

function animateCounter(counter) {
  const target = Number(counter.dataset.count)
  const duration = 1000
  const startTime = performance.now()

  const update = (time) => {
    const progress = Math.min((time - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    counter.textContent = Math.floor(target * eased).toLocaleString('ko-KR')

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

function setupEmailCopy() {
  const copyButton = document.querySelector('.copy-email')
  if (!copyButton) return

  const statusText = copyButton.querySelector('small')

  copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.copy

    try {
      await navigator.clipboard.writeText(email)
      copyButton.classList.add('is-copied')
      statusText.textContent = 'Copied'
      window.setTimeout(() => {
        copyButton.classList.remove('is-copied')
        statusText.textContent = 'Click to copy'
      }, 1600)
    } catch {
      window.location.href = `mailto:${email}`
    }
  })
}

function createRevealObserver() {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        entry.target.classList.add('active')
        entry.target.dispatchEvent(new Event('reveal'))
      })
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -40px',
    },
  )
}

window.addEventListener('beforeunload', () => {
  document.body.classList.remove('loaded')
})
