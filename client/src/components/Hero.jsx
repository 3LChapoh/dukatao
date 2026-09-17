export default function Hero({ stats, heroImages = [] }) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=600&h=800&q=80&auto=format&fit=crop',
  ]

  const images = heroImages.length > 0 ? heroImages : fallbackImages

  return (
    <section className="hero" id="home">
      <div className="hero-layer far" />

      <div className="hero-collage">
        {images.slice(0, 5).map((image, i) => {
          const src = typeof image === 'string' ? image : image.url
          return (
            <div
              className={`hero-slot ${['fx1', 'fx2', 'fx3'][i % 3]}`}
              key={`${src}-${i}`}
              style={{ animationDelay: `${-i * 3.4}s` }}
            >
              <img
                src={src}
                alt="Fine fragrance"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          )
        })}
      </div>

      <div className="hero-layer near" />

      <div className="hero-copy">
        <div className="eyebrow">
          Nairobi's house of fine fragrance
        </div>

        <h1>
          Wear something <em>unforgettable.</em>
        </h1>

        <p>
          A considered house of fine perfume, rare attars and beautiful
          scent rituals from Nairobi.
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
            <strong>{stats.fragrances}</strong>
            <span>Fragrances</span>
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
