import { categories } from '../data/categories'

export default function CategoryStrip({ onSelect }) {
  return (
    <section id="categories" className="wrap reveal in">
      <div className="section-head">
        <div>
          <div className="eyebrow">Shop by category</div>
          <h2>Find what you need</h2>
        </div>
        <span className="muted" style={{ fontSize: 11 }}>
          Swipe to explore →
        </span>
      </div>
      <div className="cat-track">
        {categories.map((c, i) => (
          <button className="cat" style={{ '--accent': c.color }} key={c.id} onClick={() => onSelect(c.id)}>
            <span className="num">0{i + 1}</span>
            <b>{c.name}</b>
            <small>{c.desc}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
