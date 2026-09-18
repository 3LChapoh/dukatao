import { useEffect, useRef, useState } from 'react'

// Single source of truth for scroll-driven chrome so the top nav and bottom
// nav fade together instead of drifting out of sync with separate listeners.
export function useScrollNav() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [progress, setProgress] = useState(0)
  const lastY = useRef(0)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 80)
      // Fade the chrome away while scrolling down past the fold, bring it
      // back the moment the user scrolls up (or is near the top).
      setHidden(y > 140 && y > lastY.current)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(y / max, 1) : 0)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { scrolled, hidden, progress }
}
