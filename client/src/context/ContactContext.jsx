import { createContext, useContext, useEffect, useState } from 'react'
import { configApi } from '../api'

const ContactContext = createContext({ whatsapp: '', email: '' })

export function ContactProvider({ children }) {
  const [contact, setContact] = useState({ whatsapp: '', email: '' })

  useEffect(() => {
    configApi.get().then(setContact).catch(() => {})
  }, [])

  return <ContactContext.Provider value={contact}>{children}</ContactContext.Provider>
}

export function useContact() {
  return useContext(ContactContext)
}

// Builds a wa.me deep link with a prefilled, URL-encoded message.
// No WhatsApp Business API involved — this just opens a chat with the text ready to send.
export function whatsappLink(number, message) {
  if (!number) return null
  const digits = number.replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}

export function mailtoLink(email, subject, body) {
  if (!email) return null
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const qs = params.toString()
  return `mailto:${email}${qs ? `?${qs}` : ''}`
}
