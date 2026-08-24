import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

function initLenis(): void {
  if (REDUCED) return
  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.09,
    allowNestedScroll: true
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)
  const hash = window.location.hash
  if (hash && document.querySelector(hash)) {
    lenis.scrollTo(hash, { immediate: true, force: true })
  }
}

function scrollToTarget(hash: string): void {
  if (lenis) {
    lenis.scrollTo(hash, { offset: -(64 + 24), duration: 1.2 })
    return
  }
  document.querySelector(hash)?.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' })
}

function initAnchors(): void {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]')
    if (!anchor) return
    const hash = anchor.getAttribute('href')
    if (!hash || hash === '#') return
    e.preventDefault()
    scrollToTarget(hash)
  })
}

function initNavState(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (!nav) return
  ScrollTrigger.create({
    start: 16,
    end: 'max',
    onUpdate: () => {
      nav.dataset.scrolled = window.scrollY > 16 ? 'true' : 'false'
    }
  })
}

function initClock(): void {
  const clock = document.getElementById('clock')
  if (!clock) return
  const fmt = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const tick = () => {
    clock.textContent = fmt.format(new Date())
  }
  tick()
  window.setInterval(tick, 1000)
}

let toastTimer = 0

function showToast(message: string): void {
  const toast = document.getElementById('toast')
  const text = document.getElementById('toast-text')
  if (!toast || !text) return
  text.textContent = message
  toast.classList.add('show')
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600)
}

function initCopyEmail(): void {
  document.querySelectorAll<HTMLElement>('[data-copy-email]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const email = btn.dataset.copyEmail
      if (!email) return
      navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard'))
    })
  })
}

function setInitialStates(): void {
  gsap.set('[data-hero-line]', { yPercent: 115 })
  gsap.set('[data-reveal]', { yPercent: 115 })
  gsap.set('[data-fade]', { y: 28, opacity: 0 })
  gsap.set('[data-line]', { scaleX: 0 })
  gsap.set('[data-row]', { y: 36, opacity: 0 })
}

function introTimeline(): gsap.core.Timeline | null {
  const panels = gsap.utils.toArray<HTMLElement>('.intro__panel')
  const mark = document.querySelector<HTMLElement>('.intro__mark')
  const overlay = document.querySelector<HTMLElement>('.intro')
  if (!panels.length) return null

  const tl = gsap.timeline()
  if (mark) {
    tl.from(mark, { opacity: 0, duration: 0.5, ease: 'power2.out' })
      .to(mark, { opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.15')
  }
  tl.to(panels, {
    yPercent: (i) => (i === 0 ? -101 : 101),
    duration: 1,
    ease: 'expo.inOut',
    stagger: 0.06
  })
  if (overlay) {
    tl.set(overlay, { display: 'none' })
  }
  return tl
}

function heroReveal(delay = 0): void {
  const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line]')
  const fades = gsap.utils.toArray<HTMLElement>('.hero [data-fade]')
  const tl = gsap.timeline({ delay })

  tl.to(lines, {
    yPercent: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.09
  }).to(
    fades,
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.08
    },
    '-=0.7'
  )
}

function playIntro(): void {
  if (REDUCED) {
    gsap.set('.intro', { display: 'none' })
    return
  }
  setInitialStates()

  const introTl = introTimeline()
  heroReveal(Math.max(0, (introTl?.duration() ?? 1) - 0.6))
}

function initScrollReveals(): void {
  if (REDUCED) return

  gsap.utils.toArray<HTMLElement>('main [data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return
    gsap.to(el, {
      yPercent: 0,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: 'top 86%',
        once: true
      }
    })
  })

  ScrollTrigger.batch(
    gsap.utils
      .toArray<HTMLElement>('main [data-fade]')
      .filter((el) => !el.closest('.hero')),
    {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09
      })
    }
  )

  ScrollTrigger.batch('[data-row]', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.07
      })
  })

  gsap.utils.toArray<HTMLElement>('[data-line]').forEach((el) => {
    gsap.to(el, {
      scaleX: 1,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        once: true
      }
    })
  })
}

function initProgress(): void {
  if (REDUCED) return
  const bar = document.querySelector<HTMLElement>('.nav__progress')
  if (!bar) return
  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      start: 0,
      end: 'max',
      scrub: 0.4
    }
  })
}

function initHeroDrift(): void {
  if (REDUCED) return
  const hero = document.querySelector<HTMLElement>('.hero')
  const inner = document.querySelector<HTMLElement>('.hero__inner')
  if (!hero || !inner) return
  gsap.to(inner, {
    yPercent: -7,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom 35%',
      scrub: true
    }
  })
}

function initRail(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-rail]')
  if (!items.length) return
  items.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.dataset.rail
      if (id) scrollToTarget(`#${id}`)
    })
  })
  if (REDUCED) return
  items.forEach((item) => {
    const id = item.dataset.rail
    if (!id) return
    const section = document.getElementById(id)
    if (!section) return
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => item.classList.toggle('is-active', self.isActive)
    })
  })
}

function initMagnet(): void {
  if (REDUCED || !window.matchMedia('(pointer: fine)').matches) return
  document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })
    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect()
      xTo((e.clientX - rect.left - rect.width / 2) * 0.22)
      yTo((e.clientY - rect.top - rect.height / 2) * 0.32)
    })
    el.addEventListener('pointerleave', () => {
      xTo(0)
      yTo(0)
    })
  })
}

function boot(): void {
  initLenis()
  initAnchors()
  initNavState()
  initClock()
  initCopyEmail()
  initRail()
  playIntro()
  initScrollReveals()
  initHeroDrift()
  initProgress()
  initMagnet()
  ScrollTrigger.refresh()

  const idle = () => ScrollTrigger.refresh()
  const ric = (
    window as Window & { requestIdleCallback?: (cb: () => void) => number }
  ).requestIdleCallback
  if (typeof ric === 'function') ric(idle)
  else window.setTimeout(idle, 200)

  window.addEventListener('load', () => ScrollTrigger.refresh())
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  boot()
}
