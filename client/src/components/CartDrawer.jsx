import { useState } from 'react'
import { imageUrl, ordersApi } from '../api'
import { money } from '../utils'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useContact, whatsappLink, mailtoLink } from '../context/ContactContext'

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const isValidKenyanPhone = (v) => /^(?:\+?254|0)7\d{8}$|^(?:\+?254|0)1\d{8}$/.test(v.trim().replace(/\s+/g, ''))

function orderSummaryText(order, items) {
  const lines = items.map((i) => `• ${i.qty} × ${i.name} — ${money(i.price * i.qty)}`)
  return [
    `New order ${order._id.slice(-7).toUpperCase()}`,
    `From: ${order.customerName} (${order.customerPhone})`,
    `Deliver to: ${order.deliveryLocation}`,
    `Payment: ${order.paymentMethod}`,
    '',
    ...lines,
    '',
    `Total: ${money(order.total)}`,
  ].join('\n')
}

export default function CartDrawer({ onClose, onOrdersUpdated }) {
  const { items, changeQty, total, clear } = useCart()
  const { token, user, updateProfile } = useAuth()
  const showToast = useToast()
  const { whatsapp, email } = useContact()
  const [checkingOut, setCheckingOut] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState({})
  const [placedOrder, setPlacedOrder] = useState(null) // { order, items } snapshot after success
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.address || '',
    payment: 'M-Pesa',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter your name'
    if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address'
    if (!isValidKenyanPhone(form.phone)) nextErrors.phone = 'Enter a valid Kenyan phone number (e.g. 07XXXXXXXX)'
    if (!form.location.trim()) nextErrors.location = 'Enter a delivery location'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setPlacing(true)
    try {
      const order = await ordersApi.create(
        {
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          deliveryLocation: form.location,
          paymentMethod: form.payment,
        },
        token
      )
      setPlacedOrder({ order, items: [...items] })
      clear()
      onOrdersUpdated?.()

      if (token && user) {
        const changed =
          form.name.trim() !== (user.name || '') ||
          form.phone.trim() !== (user.phone || '') ||
          form.location.trim() !== (user.address || '')
        if (changed) {
          updateProfile({ name: form.name, phone: form.phone, address: form.location }).catch(() => {
            // Order already succeeded — a failed profile sync just means next checkout
            // won't be prefilled with these details, nothing to surface to the customer here.
          })
        }
      }
    } catch (err) {
      showToast(err.message || 'Could not place order', true)
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrder) {
    const summary = orderSummaryText(placedOrder.order, placedOrder.items)
    const waLink = whatsappLink(whatsapp, summary)
    const mailLink = mailtoLink(email, `Order ${placedOrder.order._id.slice(-7).toUpperCase()}`, summary)

    return (
      <>
        <div className="drawer-head">
          <h2>Order placed</h2>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="notice">
          Thank you — order <b>{placedOrder.order._id.slice(-7).toUpperCase()}</b> is confirmed. Speed things up by
          sending us the details directly:
        </div>
        {!user && (
          <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
            Save this order ID — you can check its status anytime from the account icon → "Track it here",
            using this ID and {form.email}.
          </p>
        )}
        <div className="actions" style={{ flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {waLink && (
            <a className="goldbtn" href={waLink} target="_blank" rel="noreferrer" style={{ textAlign: 'center' }}>
              Notify us on WhatsApp
            </a>
          )}
          {mailLink && (
            <a className="ghostbtn" href={mailLink} style={{ textAlign: 'center' }}>
              Email us the order
            </a>
          )}
          <button className="ghostbtn" onClick={onClose}>
            Done
          </button>
        </div>
      </>
    )
  }

  if (checkingOut) {
    return (
      <>
        <div className="drawer-head">
          <h2>Checkout</h2>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="notice">Real order — this deducts stock and saves to the database.</div>
        <form className="form" onSubmit={submit} noValidate>
          <label>
            Name
            <input className="field" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </label>
          <label>
            Email
            <input className="field" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </label>
          <label>
            Phone
            <input className="field" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="07XX XXX XXX" />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </label>
          <label>
            Delivery location
            <input className="field" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Westlands, Nairobi" />
            {errors.location && <div className="field-error">{errors.location}</div>}
          </label>
          <label>
            Payment method
            <select className="field" value={form.payment} onChange={(e) => update('payment', e.target.value)}>
              <option>M-Pesa</option>
              <option>Card</option>
              <option>Cash on delivery</option>
            </select>
          </label>
          <div className="total">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <button className="goldbtn" disabled={placing}>
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </form>
      </>
    )
  }

  return (
    <>
      <div className="drawer-head">
        <h2>Your bag</h2>
        <button className="close" onClick={onClose}>
          ×
        </button>
      </div>
      {items.length ? (
        <>
          {items.map((i) => (
            <div className="cart-row" key={i.productId}>
              <img src={imageUrl(i.image) || undefined} alt="" />
              <div>
                <b className="serif">{i.name}</b>
                <div className="qty">
                  <button onClick={() => changeQty(i.productId, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button
                    onClick={() => {
                      if (i.qty >= i.stock) return showToast(`Only ${i.stock} left in stock`, true)
                      changeQty(i.productId, 1)
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <b className="mono" style={{ fontSize: 11 }}>
                {money(i.price * i.qty)}
              </b>
            </div>
          ))}
          <div className="total">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <button className="goldbtn" style={{ width: '100%' }} onClick={() => setCheckingOut(true)}>
            Proceed to checkout
          </button>
        </>
      ) : (
        <div className="notice">Your bag is waiting for something beautiful.</div>
      )}
    </>
  )
}
