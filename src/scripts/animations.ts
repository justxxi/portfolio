import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, CustomEase)

const REDUCED: boolean = window.matchMedia('(prefers-reduced-motion: reduce)').matches

CustomEase.create('expo.aristocrat', 'M0,0 C0.05,0 0.1,0.4 0.3,0.7 0.5,1 0.6,1 1,1')

function lerp(a: number, b: number, n: number): number {
  return a + (b - a) * n
}

function initLenis(): Lenis {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: REDUCED ? 1 : 0.08,
    allowNestedScroll: true
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)
  return lenis
}

function initCursor(): void {
  const cursor: HTMLElement | null = document.querySelector<HTMLElement>('[data-cursor]')
  if (!cursor) return
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none'
    return
  }
  document.documentElement.classList.add('has-cursor')

  let cx = -100
  let cy = -100
  let tx = -100
  let ty = -100
  let visible = false
  let rafId = 0

  const hoverSelector = 'a, button, [data-hover], .project'

  const onMove = (e: MouseEvent): void => {
    tx = e.clientX
    ty = e.clientY
    if (!visible) {
      cx = tx
      cy = ty
      visible = true
      cursor.dataset.hidden = 'false'
    }
  }

  const onLeaveDoc = (): void => {
    cursor.dataset.hidden = 'true'
  }

  const onEnterDoc = (): void => {
    cursor.dataset.hidden = 'false'
  }

  const onOver = (e: MouseEvent): void => {
    const target = e.target as Element | null
    if (target && target.closest(hoverSelector)) {
      cursor.dataset.hover = 'true'
    }
  }

  const onOut = (e: MouseEvent): void => {
    const target = e.target as Element | null
    const related = e.relatedTarget as Element | null
    if (target && target.closest(hoverSelector)) {
      if (!related || !related.closest(hoverSelector)) {
        cursor.dataset.hover = 'false'
      }
    }
  }

  const tick = (): void => {
    const factor: number = REDUCED ? 1 : 0.12
    cx = lerp(cx, tx, factor)
    cy = lerp(cy, ty, factor)
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
    rafId = requestAnimationFrame(tick)
  }

  document.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeaveDoc)
  document.addEventListener('mouseenter', onEnterDoc)
  document.addEventListener('mouseover', onOver)
  document.addEventListener('mouseout', onOut)
  window.addEventListener('blur', onLeaveDoc)
  window.addEventListener('focus', onEnterDoc)

  rafId = requestAnimationFrame(tick)

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId)
  })
}

function initNavScroll(): void {
  const nav: HTMLElement | null = document.querySelector<HTMLElement>('[data-nav]')
  if (!nav) return
  const update = (): void => {
    nav.dataset.scrolled = window.scrollY > 24 ? 'true' : 'false'
  }
  update()
  ScrollTrigger.create({
    start: 'top -24',
    end: 99999,
    onUpdate: update
  })
}


function initSectionReveals(): void {
  if (REDUCED) {
    gsap.utils.toArray<HTMLElement>('.section-rule').forEach((el) => {
      gsap.set(el, { scaleX: 1 })
    })
    return
  }

  gsap.utils.toArray<HTMLElement>('[data-section]').forEach((section) => {
    const rule = section.querySelector<HTMLElement>('.section-rule')
    const title = section.querySelector<HTMLElement>('.section-title')
    if (!rule || !title) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
      }
    })
    tl.fromTo(
      rule,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.7, ease: 'expo.aristocrat' }
    )
    tl.from(
      title,
      { opacity: 0, y: 18, duration: 0.9, ease: 'expo.aristocrat' },
      '-=0.4'
    )
  })
}

function initProjectReveals(): void {
  if (REDUCED) return

  gsap.utils.toArray<HTMLElement>('.project').forEach((el) => {
    const targets: HTMLElement[] = Array.from(
      el.querySelectorAll<HTMLElement>(
        '.project__name, .project__desc, .project__detail, .project__action, .project__tags .tag, .project__number'
      )
    )
    if (targets.length === 0) return

    gsap.from(targets, {
      opacity: 0,
      y: 14,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    })
  })
}

function initAboutReveals(): void {
  if (REDUCED) return

  const bodies: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>('.about-position, .about-body')
  )
  if (bodies.length > 0) {
    gsap.from(bodies, {
      opacity: 0,
      y: 14,
      stagger: 0.1,
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

  const caps: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>('[data-cap]')
  )
  if (caps.length > 0) {
    gsap.from(caps, {
      opacity: 0,
      y: 6,
      stagger: 0.055,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: caps[0] ?? null,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    })
  }
}

function initFooterReveal(): void {
  if (REDUCED) return
  const footer = document.querySelector<HTMLElement>('[data-footer]')
  if (!footer) return
  const items: HTMLElement[] = Array.from(
    footer.querySelectorAll<HTMLElement>('[data-footer-item]')
  )
  if (items.length === 0) return
  gsap.from(items, {
    opacity: 0,
    y: 10,
    duration: 0.9,
    stagger: 0.1,
    ease: 'expo.aristocrat',
    scrollTrigger: {
      trigger: footer,
      start: 'top 90%',
      toggleActions: 'play none none none',
      once: true
    }
  })
}

function boot(): void {
  initLenis()
  initCursor()
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
      initProjectReveals()
      idle(() => {
        initAboutReveals()
        initFooterReveal()
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
