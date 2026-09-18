import { useEffect, useMemo, useState } from 'react'

const EFFECTS = ['fx1', 'fx2', 'fx3']
const SLOT_COUNT = 4
const ROTATE_INTERVAL_MS = 9000 // roughly the quiet point of the 18s per-slot loop

function pickEffect() {
  return EFFECTS[Math.floor(Math.random() * EFFECTS.length)]
}

function srcOf(image) {
  return typeof image === 'string' ? image : image?.url
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
  const effects = useMemo(
    () => Array.from({ length: SLOT_COUNT }, pickEffect),
    [pool.length]
  )

  const [slotIndexes, setSlotIndexes] = useState(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => i % Math.max(pool.length, 1))
  )

  useEffect(() => {
    setSlotIndexes(Array.from({ length: SLOT_COUNT }, (_, i) => i % Math.max(pool.length, 1)))
  }, [pool.length])

  // When there's more than one image available, keep randomly reshuffling
  // which image each slot shows, so the collage keeps changing over time
  // instead of looping the same five images forever.
  useEffect(() => {
    if (pool.length <= 1) return
    const timer = setInterval(() => {
      setSlotIndexes((prev) =>
        prev.map((idx) => {
          let next = Math.floor(Math.random() * pool.length)
          if (pool.length > 1 && next === idx) next = (next + 1) % pool.length
          return next
        })
      )
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(timer)
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
          : slotIndexes.map((imgIdx, i) => {
              const src = srcOf(pool[imgIdx])
              return (
                <div
                  className={`hero-slot ${effects[i]}`}
                  key={i}
                  style={{ animationDelay: `${-i * 3.4}s` }}
                >
                  <img src={src} alt="Household product" loading={i === 0 ? 'eager' : 'lazy'} />
                </div>
              )
            })}
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
