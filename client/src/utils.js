export function money(n) {
  return 'KES ' + Number(n || 0).toLocaleString()
}
