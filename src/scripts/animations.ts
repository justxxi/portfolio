import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const REDUCED: boolean = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function initLenis(): Lenis | null {
  if (REDUCED) return null
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.085,
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
    nav.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false'
  }
  update()
  ScrollTrigger.create({
    start: 'top -8',
    end: 99999,
    onUpdate: update
  })
}

function initSectionReveals(): void {
  if (REDUCED) return
  gsap.utils.toArray<HTMLElement>('[data-section]').forEach((section) => {
    const title = section.querySelector<HTMLElement>('.section-title')
    const sub = section.querySelector<HTMLElement>('.section-sub')
    if (title) {
      gsap.from(title, {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          toggleActions: 'play none none none',
          once: true
        }
      })
    }
    if (sub) {
      gsap.from(sub, {
        opacity: 0,
        y: 16,
        duration: 0.9,
        delay: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          toggleActions: 'play none none none',
          once: true
        }
      })
    }
  })
}

function initCardReveals(): void {
  if (REDUCED) return
  const cards = gsap.utils.toArray<HTMLElement>('.project, .contact-card, .about__caps')
  cards.forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 28,
      duration: 0.9,
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

function initAboutReveals(): void {
  if (REDUCED) return
  const bodies = gsap.utils.toArray<HTMLElement>('.about-body, .about-meta')
  if (bodies.length === 0) return
  gsap.from(bodies, {
    opacity: 0,
    y: 16,
    stagger: 0.08,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: bodies[0] ?? null,
      start: 'top 85%',
      toggleActions: 'play none none none',
      once: true
    }
  })
}

function boot(): void {
  initLenis()
  initNavScroll()
  document.body.classList.add('is-ready')

  const idle = (cb: () => void): void => {
    const ric = (window as Window & { requestIdleCallback?: (cb: IdleRequestCallback) => number }).requestIdleCallback
    if (typeof ric === 'function') ric(() => cb())
    else window.setTimeout(cb, 1)
  }

  idle(() => {
    initSectionReveals()
    idle(() => {
      initCardReveals()
      idle(() => {
        initAboutReveals()
        ScrollTrigger.refresh()
      })
    })
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  boot()
}
