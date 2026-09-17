import { useState } from 'react'

export default function PasswordField({ value, onChange, placeholder, required, className = 'field' }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field-wrap">
      <input
        className={className}
        type={visible ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path
            className="eye-lid"
            d={visible ? 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z' : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z'}
            style={{ transition: 'd 0.25s ease' }}
          />
          <circle className="eye-pupil" cx="12" cy="12" r={visible ? 3 : 0.5} style={{ transition: 'r 0.25s ease' }} />
          <line
            className="eye-slash"
            x1="3" y1="3" x2="21" y2="21"
            style={{ opacity: visible ? 0 : 1, transition: 'opacity 0.25s ease' }}
          />
        </svg>
      </button>
    </div>
  )
}
