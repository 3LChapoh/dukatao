export default function Hero({ stats, heroImages = [] }) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583845112203-29329902332e?w=600&h=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=800&q=80&auto=format&fit=crop',
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
                alt="Home essentials"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          )
        })}
      </div>

      <div className="hero-layer near" />

      <div className="hero-copy">
        <div className="eyebrow">
          Nairobi's home essentials store
        </div>

        <h1>
          Everything your home <em>needs.</em>
        </h1>

        <p>
          Quality kitchenware, appliances and home essentials, delivered
          across Nairobi.
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
            Shop Now
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
