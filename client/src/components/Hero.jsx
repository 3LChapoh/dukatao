import { useEffect, useMemo, useState } from 'react'

const EFFECTS = ['fx1', 'fx2', 'fx3']
const SLOT_COUNT = 4
const MIN_ROTATE_MS = 7000
const MAX_ROTATE_MS = 15000
const CROSSFADE_MS = 900

function pickEffect() {
  return EFFECTS[Math.floor(Math.random() * EFFECTS.length)]
}

function srcOf(image) {
  return typeof image === 'string' ? image : image?.url
}

function randomDelay() {
  return MIN_ROTATE_MS + Math.random() * (MAX_ROTATE_MS - MIN_ROTATE_MS)
}

// Renders one collage slot and crossfades smoothly whenever its `src` prop
// changes, instead of popping straight to the new image.
function HeroSlot({ src, effectClass, delayStyle, eager }) {
  const [displaySrc, setDisplaySrc] = useState(src)
  const [incomingSrc, setIncomingSrc] = useState(null)
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    if (src === displaySrc) return
    setIncomingSrc(src)
    setReveal(false)
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReveal(true))
    })
    const settle = setTimeout(() => {
      setDisplaySrc(src)
      setIncomingSrc(null)
      setReveal(false)
    }, CROSSFADE_MS + 60)
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
      clearTimeout(settle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return (
    <div className={`hero-slot ${effectClass}`} style={delayStyle}>
      <img className="hs-img" src={displaySrc} alt="Household product" loading={eager ? 'eager' : 'lazy'} />
      {incomingSrc && (
        <img className={`hs-img hs-incoming${reveal ? ' reveal' : ''}`} src={incomingSrc} alt="" aria-hidden="true" />
      )}
    </div>
  )
}

export default function Hero({ stats, heroImages = [], loading = false }) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583845112203-29329902332e?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=800&q=80&auto=format&fit=crop',
  ]

  // Only fall back to the generic stock photos once we're sure the real,
  // admin-configured hero images have already been checked for — otherwise
  // we briefly render the wrong images before the intended ones arrive.
  const pool = heroImages.length > 0 ? heroImages : fallbackImages

  // Each slot gets a randomly chosen reveal effect, re-rolled whenever the
  // image pool itself changes (not on every render).
  const effects = useMemo(() => Array.from({ length: SLOT_COUNT }, pickEffect), [pool.length])

  const [slotIndexes, setSlotIndexes] = useState(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => i % Math.max(pool.length, 1))
  )

  useEffect(() => {
    setSlotIndexes(Array.from({ length: SLOT_COUNT }, (_, i) => i % Math.max(pool.length, 1)))
  }, [pool.length])

  // Each slot rotates on its own independently randomized timer, so all four
  // never change at once — and each pick avoids whatever image any other
  // slot is currently showing, so the same photo never appears twice.
  useEffect(() => {
    if (pool.length <= 1) return
    const timers = []

    function scheduleNext(slotIdx) {
      const id = setTimeout(() => {
        setSlotIndexes((prev) => {
          const usedElsewhere = prev.filter((_, i) => i !== slotIdx)
          const options = pool
            .map((_, i) => i)
            .filter((i) => i !== prev[slotIdx] && !usedElsewhere.includes(i))
          const pick = options.length
            ? options[Math.floor(Math.random() * options.length)]
            : (prev[slotIdx] + 1) % pool.length
          const next = [...prev]
          next[slotIdx] = pick
          return next
        })
        scheduleNext(slotIdx)
      }, randomDelay())
      timers.push(id)
    }

    for (let i = 0; i < SLOT_COUNT; i++) scheduleNext(i)
    return () => timers.forEach(clearTimeout)
  }, [pool.length])

  return (
    <section className="hero" id="home">
      <div className="hero-layer far" />

      <div className="hero-collage">
        {loading
          ? Array.from({ length: SLOT_COUNT }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className={`hero-slot ${EFFECTS[i % EFFECTS.length]} hero-slot-skeleton`}
                style={{ animationDelay: `${-i * 3.4}s` }}
              />
            ))
          : slotIndexes.map((imgIdx, i) => (
              <HeroSlot
                key={i}
                src={srcOf(pool[imgIdx])}
                effectClass={effects[i]}
                delayStyle={{ animationDelay: `${-i * 3.4}s` }}
                eager={i === 0}
              />
            ))}
      </div>

      <div className="hero-layer near" />

      <div className="hero-copy">
        <div className="eyebrow">
          DukaTao — Kenya's home essentials shop
        </div>

        <h1>
          Everything your home <em>needs.</em>
        </h1>

        <p>
          Kitchen, cleaning, storage, electronics and more — quality
          household products delivered across Kenya, pay on delivery.
        </p>

        <div className="cta">
          <button
            className="goldbtn"
            onClick={() =>
              document
                .getElementById('collection')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Explore the Collection
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <strong>{stats.products}</strong>
            <span>Products</span>
          </div>

          <div className="stat">
            <strong>4.9/5</strong>
            <span>Rating</span>
          </div>
        </div>
      </div>
    </section>
  )
}
