'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: { bg: 'rgba(13,61,30,0.95)', border: 'rgba(34,197,94,0.3)',  color: '#22c55e' },
    error:   { bg: 'rgba(60,10,10,0.95)', border: 'rgba(255,100,100,0.3)', color: 'rgba(255,130,130,0.9)' },
    info:    { bg: 'rgba(20,40,70,0.95)', border: 'rgba(100,150,255,0.3)', color: 'rgba(150,180,255,0.9)' },
  }

  const c = colors[type]

  return (
    <div style={{
      position:'fixed', bottom:'28px', right:'28px', zIndex:999,
      padding:'14px 20px', borderRadius:'12px',
      fontSize:'14px', fontWeight:600,
      display:'flex', alignItems:'center', gap:'10px',
      maxWidth:'320px',
      background:c.bg, border:`1px solid ${c.border}`, color:c.color,
      backdropFilter:'blur(12px)',
      animation:'fadeUp 0.3s ease forwards',
    }}>
      {message}
    </div>
  )
}
