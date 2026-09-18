import { useContact, whatsappLink, mailtoLink } from '../context/ContactContext'

export default function Footer({ onOpenAccount }) {
  const { whatsapp, email } = useContact()
  const waLink = whatsappLink(whatsapp, 'Hi DukaTao, I have a question about an order.')
  const mailLink = mailtoLink(email, 'Question about DukaTao')

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="logo">
            Duka<span>Tao</span>
          </div>
          <p className="muted" style={{ fontSize: 12, maxWidth: 320 }}>
            Household products for Kenyan homes — kitchen, cleaning, storage, electronics and more.
          </p>
        </div>
        <div>
          <b style={{ fontSize: 12 }}>Shop</b>
          <div className="navlinks" style={{ flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <a href="#collection">Collection</a>
            <a href="#categories">Categories</a>
            <button type="button" className="navlink-btn" onClick={onOpenAccount}>
              Orders
            </button>
          </div>
        </div>
        <div>
          <b style={{ fontSize: 12 }}>Contact</b>
          <div className="navlinks" style={{ flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            )}
            {mailLink && <a href={mailLink}>Email us</a>}
          </div>
        </div>
      </div>
      <div className="wrap muted" style={{ fontSize: 11, paddingTop: 20 }}>
        © {new Date().getFullYear()} DukaTao. <a href="#/admin">Admin</a>
      </div>
    </footer>
  )
}
