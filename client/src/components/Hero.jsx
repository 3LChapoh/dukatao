export default function Hero({ stats, heroImages = [] }) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583845112203-29329902332e?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=800&q=80&auto=format&fit=crop',
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
                alt="Household product"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
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
