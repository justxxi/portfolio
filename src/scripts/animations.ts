import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

interface ModalProjectData {
  readonly name?: string
  readonly tagline?: string
  readonly description?: string
  readonly tags?: readonly string[]
  readonly repo?: string
}

const REDUCED: boolean = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function initLenis(): Lenis | null {
  if (REDUCED) return null
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.08,
    allowNestedScroll: true
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)
  return lenis
}

function initNavScroll(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (!nav) return
  const update = (): void => {
    nav.dataset.scrolled = window.scrollY > 12 ? 'true' : 'false'
  }
  update()
  ScrollTrigger.create({
    start: 'top -12',
    end: 99999,
    onUpdate: update
  })
}

function initTerminalCopy(): void {
  const terminal = document.getElementById('hero-terminal')
  const toast = document.getElementById('copy-toast')
  if (!terminal) return

  terminal.addEventListener('click', () => {
    const cmdText = 'gh repo list justxxi --limit 5'
    navigator.clipboard.writeText(cmdText).then(() => {
      if (toast) {
        toast.innerHTML = '<span style="color: #34d399;">✓</span> <span>Copied gh repo list command to clipboard!</span>'
        toast.classList.add('show')
        setTimeout(() => toast.classList.remove('show'), 2800)
      }
    })
  })
}

function initProjectModal(): void {
  const modal = document.getElementById('project-modal')
  const closeBtn = document.getElementById('modal-close-btn')
  if (!modal || !closeBtn) return

  const modalBadge = document.getElementById('modal-badge')
  const modalTitle = document.getElementById('modal-title')
  const modalTagline = document.getElementById('modal-tagline')
  const modalDesc = document.getElementById('modal-desc')
  const modalTags = document.getElementById('modal-tags')
  const modalRepoBtn = document.getElementById('modal-repo-btn') as HTMLAnchorElement | null

  function openModal(data: ModalProjectData): void {
    if (modalBadge) modalBadge.textContent = 'GITHUB REPO'
    if (modalTitle) modalTitle.textContent = data.name || ''
    if (modalTagline) modalTagline.textContent = data.tagline || ''
    if (modalDesc) modalDesc.textContent = data.description || ''
    if (modalRepoBtn && data.repo) modalRepoBtn.href = data.repo

    if (modalTags && Array.isArray(data.tags)) {
      modalTags.innerHTML = data.tags.map((t: string) => `<span class="modal-tag-chip font-mono">#${t}</span>`).join('')
    }

    modal.classList.add('active')
    modal.setAttribute('aria-hidden', 'false')
  }

  function closeModal(): void {
    modal.classList.remove('active')
    modal.setAttribute('aria-hidden', 'true')
  }

  document.querySelectorAll<HTMLElement>('[data-project-json]').forEach((btn) => {
    btn.addEventListener('click', (e: Event) => {
      e.stopPropagation()
      const jsonStr = btn.getAttribute('data-project-json')
      if (jsonStr) {
        try {
          const data: ModalProjectData = JSON.parse(jsonStr)
          openModal(data)
        } catch (err) {
          console.error('Failed to parse project json', err)
        }
      }
    })
  })

  closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', (e: Event) => {
    if (e.target === modal) closeModal()
  })

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal()
    }
  })
}

function initCommandPalette(): void {
  const cmd = document.getElementById('cmd-palette')
  const cmdTriggerBtn = document.getElementById('cmd-trigger-btn')
  const heroCmdBtn = document.getElementById('hero-cmd-btn')
  const cmdInput = document.getElementById('cmd-input') as HTMLInputElement | null
  const toast = document.getElementById('copy-toast')
  if (!cmd) return

  function openCmd(): void {
    cmd?.classList.add('active')
    cmd?.setAttribute('aria-hidden', 'false')
    setTimeout(() => cmdInput?.focus(), 50)
  }

  function closeCmd(): void {
    cmd?.classList.remove('active')
    cmd?.setAttribute('aria-hidden', 'true')
    if (cmdInput) cmdInput.value = ''
  }

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      if (cmd.classList.contains('active')) closeCmd()
      else openCmd()
    } else if (e.key === 'Escape' && cmd.classList.contains('active')) {
      closeCmd()
    }
  })

  cmdTriggerBtn?.addEventListener('click', openCmd)
  heroCmdBtn?.addEventListener('click', openCmd)

  cmd.addEventListener('click', (e: Event) => {
    if (e.target === cmd) closeCmd()
  })

  document.querySelectorAll<HTMLElement>('[data-action]').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action')
      closeCmd()

      if (action === 'projects') {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
      } else if (action === 'about') {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      } else if (action === 'contact') {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      } else if (action === 'copy-email') {
        navigator.clipboard.writeText('wyurtrft@proton.me').then(() => {
          if (toast) {
            toast.innerHTML = '<span style="color: var(--color-accent);">●</span> <span>Email copied to clipboard!</span>'
            toast.classList.add('show')
            setTimeout(() => toast.classList.remove('show'), 2800)
          }
        })
      } else if (action === 'github') {
        window.open('https://github.com/justxxi', '_blank')
      }
    })
  })
}

function initReveals(): void {
  if (REDUCED) return

  gsap.utils.toArray<HTMLElement>('.card').forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true
      }
    })
  })
}

function boot(): void {
  initLenis()
  initNavScroll()
  initTerminalCopy()
  initProjectModal()
  initCommandPalette()
  document.body.classList.add('is-ready')

  const idle = (cb: () => void): void => {
    const ric = (window as Window & { requestIdleCallback?: (cb: IdleRequestCallback) => number }).requestIdleCallback
    if (typeof ric === 'function') ric(() => cb())
    else window.setTimeout(cb, 1)
  }

  idle(() => {
    initReveals()
    ScrollTrigger.refresh()
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  boot()
}
