export const categories = [
  { id: 'edp', name: 'Eau de Parfum', color: '#4d91c9', desc: 'Signature compositions' },
  { id: 'oud', name: 'Oud & Attars', color: '#d65f87', desc: 'Deep, resinous trails' },
  { id: 'gifts', name: 'Gift Sets', color: '#4da873', desc: 'Curated scent rituals' },
  { id: 'mists', name: 'Body Mists', color: '#9b72c7', desc: 'Light everyday freshness' },
  { id: 'home', name: 'Home Fragrance', color: '#d29a39', desc: 'Scent your surroundings' },
  { id: 'niche', name: 'Niche & Rare', color: '#c9574d', desc: 'Limited discoveries' },
]

export function categoryFor(id) {
  return categories.find((c) => c.id === id) || categories[0]
}

export function money(n) {
  return 'KES ' + Number(n || 0).toLocaleString()
}
