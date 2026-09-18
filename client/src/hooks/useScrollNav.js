import { useEffect, useState } from 'react'

// Single source of truth for scroll-driven chrome so the top nav and bottom
// nav fade together instead of drifting out of sync with separate listeners.
export function useScrollNav() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 80)
      // The top nav stays hidden once you've scrolled past the hero section —
      // it does NOT reappear just because you scroll up. It only fades back
      // in once you've scrolled back up far enough to be within the hero
      // again. Pages without a hero (id="home") fall back to a small buffer
      // near the very top of the page.
      const hero = document.getElementById('home')
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 120
      setHidden(y > heroBottom)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(y / max, 1) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { scrolled, hidden, progress }
}
