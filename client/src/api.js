export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export function imageUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : API_BASE + path
}

async function request(path, { method = 'GET', body, token, isForm = false } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : null

  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`)
  }
  return data
}

// Builds multipart form data for product create/update (name, price, category,
// description, stock, plus image files).
function productFormData(fields, imageFiles) {
  const fd = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) fd.append(key, value)
  })
  ;(imageFiles || []).forEach((file) => fd.append('images', file))
  return fd
}

export const categoriesApi = {
  // Public storefront calls list() with no token → active categories only.
  // Admin screens pass a token → includes inactive categories too.
  list: (token) => request('/api/categories' + (token ? '?all=true' : ''), { token }),
  get: (id) => request(`/api/categories/${id}`),
  create: (payload, token) => request('/api/categories', { method: 'POST', body: payload, token }),
  update: (id, payload, token) => request(`/api/categories/${id}`, { method: 'PUT', body: payload, token }),
  remove: (id, token) => request(`/api/categories/${id}`, { method: 'DELETE', token }),
  reorder: (orderedIds, token) => request('/api/categories/reorder', { method: 'PUT', body: { orderedIds }, token }),
}

export const productsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()
    return request(`/api/products${qs ? `?${qs}` : ''}`)
  },
  get: (id) => request(`/api/products/${id}`),
  create: (fields, imageFiles, token) =>
    request('/api/products', { method: 'POST', body: productFormData(fields, imageFiles), token, isForm: true }),
  update: (id, fields, imageFiles, token) =>
    request(`/api/products/${id}`, {
      method: 'PUT',
      body: productFormData(fields, imageFiles),
      token,
      isForm: true,
    }),
  remove: (id, token) => request(`/api/products/${id}`, { method: 'DELETE', token }),
}

export const usersApi = {
  register: (payload) => request('/api/users/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/users/login', { method: 'POST', body: payload }),
  adminLogin: (payload) => request('/api/users/admin-login', { method: 'POST', body: payload }),
  adminSignup: (payload) => request('/api/users/admin-signup', { method: 'POST', body: payload }),
  adminResetPassword: (payload) => request('/api/users/admin-reset-password', { method: 'POST', body: payload }),
  me: (token) => request('/api/users/me', { token }),
  updateMe: (payload, token) => request('/api/users/me', { method: 'PUT', body: payload, token }),
}

export const ordersApi = {
  create: (payload, token) => request('/api/orders', { method: 'POST', body: payload, token }),
  mine: (token) => request('/api/orders/mine', { token }),
  cancel: (id, token) => request(`/api/orders/${id}/cancel`, { method: 'PUT', token }),
  all: (token, status) => request(`/api/orders${status ? `?status=${status}` : ''}`, { token }),
  updateStatus: (id, status, token) =>
    request(`/api/orders/${id}/status`, { method: 'PUT', body: { status }, token }),
}

export const configApi = {
  get: () => request('/api/config'),
  updateHeroImages: (files, token) => {
    const fd = new FormData()
    files.forEach((file) => fd.append('images', file))
    return request('/api/config/hero-images', { method: 'PUT', body: fd, token, isForm: true })
  },
}
