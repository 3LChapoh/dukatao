import { useEffect, useState } from 'react'
import { configApi } from '../../api'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminHero() {
  const { token } = useAdminAuth()
  const showToast = useToast()
  const [current, setCurrent] = useState([])
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    configApi
      .get()
      .then((data) => setCurrent(data.heroImages || []))
      .catch(() => {})
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (files.length === 0) {
      showToast('Choose at least one image', true)
      return
    }
    setBusy(true)
    try {
      const result = await configApi.updateHeroImages(files, token)
      setCurrent(result.heroImages)
      setFiles([])
      showToast('Hero images updated')
    } catch (err) {
      showToast(err.message || 'Failed to update hero images', true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: 13, margin: '16px 0 8px' }}>Current hero images</h3>
      {current.length === 0 && <div className="notice">No hero images set — storefront hero will show no collage.</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {current.map((img) => (
          <img key={img.publicId} src={img.url} alt="" style={{ width: 90, height: 120, objectFit: 'cover', borderRadius: 8 }} />
        ))}
      </div>

      <h3 style={{ fontSize: 13, margin: '16px 0 8px' }}>Replace hero images (up to 5)</h3>
      <form className="form" onSubmit={submit}>
        <input
          className="field"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <button className="goldbtn" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload & replace'}
        </button>
      </form>
      <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
        Uploading replaces all current hero images with the new selection.
      </p>
    </div>
  )
}
