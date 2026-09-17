export const categories = [
  { id: 'kitchen', name: 'Kitchenware', color: '#4d91c9', desc: 'Cookware, utensils & storage' },
  { id: 'appliances', name: 'Home Appliances', color: '#d65f87', desc: 'Blenders, kettles & more' },
  { id: 'cleaning', name: 'Cleaning Supplies', color: '#4da873', desc: 'Keep the home spotless' },
  { id: 'furniture', name: 'Furniture & Decor', color: '#9b72c7', desc: 'Furnish and finish a room' },
  { id: 'bedding', name: 'Bedding & Bath', color: '#d29a39', desc: 'Sheets, towels & linens' },
  { id: 'storage', name: 'Storage & Organization', color: '#c9574d', desc: 'Tidy up every corner' },
]

export function categoryFor(id) {
  return categories.find((c) => c.id === id) || categories[0]
}

export function money(n) {
  return 'KES ' + Number(n || 0).toLocaleString()
}
