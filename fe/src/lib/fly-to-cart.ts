// Only show the "dish → flying orange ball → cart" hint the first couple of
// times a customer adds something, so they learn that the floating cart button
// counts their dishes. After that it would just be noise, so we stop.
//
// The counter is in-memory (per page load), matching the cart itself — items are
// session-only, so a reload starts a fresh visit and the hint plays again.
const MAX_HINTS = 2
let shown = 0

const TARGET_SELECTOR = '[data-cart-fly-target]'

/**
 * Animate a small orange ball flying on a curve from `source` (the add button)
 * to the floating cart button, then give the cart a little pulse so its count
 * visibly reacts. No-op after the first `MAX_HINTS` adds of this visit, when
 * reduced-motion is requested, or on the server.
 */
export function flyToCart(source: HTMLElement | null) {
  if (!source || typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  if (shown >= MAX_HINTS) return

  // Reserve this play immediately so rapid taps don't all fire.
  shown += 1

  // Snapshot the source NOW — the cart button only mounts after the first item
  // is added, and that re-layout must not move our start point.
  const from = source.getBoundingClientRect()

  let tries = 0
  const run = () => {
    const target = document.querySelector<HTMLElement>(TARGET_SELECTOR)
    if (target) {
      animateBall(from, target.getBoundingClientRect())
      return
    }
    // Wait a few frames for the cart button to mount on the very first add.
    if (tries++ < 10) requestAnimationFrame(run)
  }
  run()
}

function center(r: DOMRect): [number, number] {
  return [r.left + r.width / 2, r.top + r.height / 2]
}

function animateBall(from: DOMRect, to: DOMRect) {
  const [startX, startY] = center(from)
  const [endX, endY] = center(to)

  const ball = document.createElement('div')
  ball.setAttribute('aria-hidden', 'true')
  // bg-primary keeps the orange in sync with the design token (no hardcoded hex).
  ball.className = 'pointer-events-none fixed rounded-full bg-primary shadow-lg z-50'
  Object.assign(ball.style, {
    left: `${startX}px`,
    top: `${startY}px`,
    width: '22px',
    height: '22px',
    marginLeft: '-11px',
    marginTop: '-11px',
  })
  document.body.appendChild(ball)

  const dx = endX - startX
  const dy = endY - startY
  // Lift the midpoint up so the path curves instead of going straight.
  const arc = Math.min(180, Math.abs(dx) * 0.4 + 120)

  // Grows on the way out, biggest at the top of the arc, then shrinks into the cart.
  const anim = ball.animate(
    [
      { transform: 'translate(0, 0) scale(0.4)', opacity: 1, offset: 0 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - arc}px) scale(1.25)`,
        opacity: 1,
        offset: 0.5,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.2)`,
        opacity: 0.7,
        offset: 1,
      },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, -0.2, 0.7, 1)', fill: 'forwards' },
  )

  anim.onfinish = () => {
    ball.remove()
    // Cart reacts with a small up-down bounce as the ball lands.
    document
      .querySelector<HTMLElement>(TARGET_SELECTOR)
      ?.animate(
        [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-7px)' },
          { transform: 'translateY(0)' },
          { transform: 'translateY(-3px)' },
          { transform: 'translateY(0)' },
        ],
        { duration: 450, easing: 'ease-out' },
      )
  }
}
