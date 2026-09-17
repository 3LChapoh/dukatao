import { useContact, whatsappLink, mailtoLink } from '../context/ContactContext'

export default function Footer() {
  const { whatsapp, email } = useContact()
  const waLink = whatsappLink(whatsapp, "Hi Ruby's Choice, I have a question about an order.")
  const mailLink = mailtoLink(email, "Question about Ruby's Choice")

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="logo">
            Ruby's <span>Choice</span>
          </div>
          <p className="muted" style={{ fontSize: 12, maxWidth: 320 }}>
            A multi-vendor marketplace for fine fragrance, connecting independent Nairobi
            boutiques with people who love beautiful scent.
          </p>
        </div>
        <div>
          <b style={{ fontSize: 12 }}>Shop</b>
          <div className="navlinks" style={{ flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <a href="#collection">Collection</a>
            <a href="#categories">Categories</a>
            <a href="#orders">Orders</a>
          </div>
        </div>
        <div>
          <b style={{ fontSize: 12 }}>Boutique</b>
          <div className="navlinks" style={{ flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <a href="#/vendor">Vendor sign in</a>
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
        © {new Date().getFullYear()} Boniface | Omae. <a href="#/admin">Admin</a>
      </div>
    </footer>
  )
}
