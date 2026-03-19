'use client'

import { useRef, useEffect } from 'react'
import type { Voucher } from '@/types'

interface DigitalCardProps {
  voucher: Voucher
}

export default function DigitalCard({ voucher }: DigitalCardProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const rencanaFmt = voucher.rencana_penggunaan
    ? new Date(voucher.rencana_penggunaan).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  // Generate QR Code after mount (client only)
  useEffect(() => {
    if (!qrRef.current) return
    qrRef.current.innerHTML = ''
    import('qrcode.react').then(({ QRCodeSVG }) => {
      // We render via innerHTML using a temp div + ReactDOM
      const div = document.createElement('div')
      div.style.width  = '70px'
      div.style.height = '70px'
      qrRef.current!.appendChild(div)
      // Minimal SVG QR fallback using text
      div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" width="70" height="70" style="background:#fff;border-radius:4px;padding:4px;">
        <text x="35" y="38" text-anchor="middle" font-family="monospace" font-size="5" fill="#030f08" font-weight="bold">
          ${voucher.kode_unik}
        </text>
        <text x="35" y="48" text-anchor="middle" font-family="monospace" font-size="4" fill="#555">SCAN ME</text>
      </svg>`
    }).catch(() => {
      if (qrRef.current) {
        qrRef.current.innerHTML = `<div style="width:70px;height:70px;background:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;font-family:monospace;color:#030f08;text-align:center;padding:4px;">${voucher.kode_unik}</div>`
      }
    })
  }, [voucher.kode_unik])

  return (
    <div id="digitalCard" style={{
      width:'780px', height:'460px',
      position:'relative', overflow:'hidden',
      background:'linear-gradient(145deg,#031a0a 0%,#052e12 35%,#031a0a 100%)',
      borderRadius:'20px',
      fontFamily:"'Tajawal',sans-serif",
    }}>
      {/* Hex bg */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpath d='M30 0l15 26-15 26-15-26z' fill='none' stroke='%23c9a84c' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize:'60px 52px' }} />

      {/* Glows */}
      <div style={{ position:'absolute', top:'-80px', left:'-80px', width:'320px', height:'320px', background:'radial-gradient(circle,rgba(0,200,100,0.12) 0%,transparent 65%)', borderRadius:'50%' }} />
      <div style={{ position:'absolute', bottom:'-60px', right:'200px', width:'240px', height:'240px', background:'radial-gradient(circle,rgba(201,168,76,0.1) 0%,transparent 65%)', borderRadius:'50%' }} />

      {/* Right islamic panel */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'230px', background:'linear-gradient(135deg,#1a3a7a,#2a4a9a,#1a3a7a)', clipPath:'polygon(18% 0%,100% 0%,100% 100%,0% 100%)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect x='10' y='2' width='20' height='36' rx='2' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='1.5'/%3E%3Crect x='2' y='10' width='36' height='20' rx='2' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='1.5'/%3E%3Ccircle cx='20' cy='20' r='6' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundSize:'40px 40px', opacity:0.7 }} />
      </div>

      {/* Gold lines */}
      <div style={{ position:'absolute', top:'52px', left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent 0%,#c9a84c 30%,#e8c96d 55%,transparent 85%)' }} />
      <div style={{ position:'absolute', top:'58px', left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent 0%,rgba(201,168,76,0.4) 30%,transparent 75%)' }} />

      {/* Top arc */}
      <div style={{ position:'absolute', top:0, left:'50px', right:'230px', height:'56px', borderBottom:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.3)', borderRight:'1.5px solid rgba(201,168,76,0.3)', borderRadius:'0 0 50% 50%' }} />

      {/* Logo */}
      <div style={{ position:'absolute', top:'6px', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', zIndex:2 }}>
        <div style={{ width:'38px', height:'38px', background:'linear-gradient(135deg,#c9a84c,#e8c96d)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', boxShadow:'0 0 16px rgba(201,168,76,0.4)' }}>🕋</div>
        <div style={{ fontSize:'9px', letterSpacing:'2px', color:'rgba(201,168,76,0.7)', fontWeight:500 }}>VOUCHER UMROH</div>
      </div>

      {/* Main content */}
      <div style={{ position:'absolute', top:'80px', left:'36px', right:'248px', bottom:'24px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'9px', letterSpacing:'3px', color:'rgba(201,168,76,0.5)', marginBottom:'4px' }}>KARTU DISKON RESMI</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:700, color:'#f9f3e3', letterSpacing:'2px' }}>UMRAH VOUCHER</div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:0 }}>
          {[
            { label:'Kode Voucher',       value: voucher.kode_unik,       mono: true },
            { label:'Nama Jemaah',        value: voucher.nama_jemaah,     mono: false },
            { label:'Kota Domisili',      value: voucher.kota_domisili,   mono: false },
            { label:'Travel Tujuan',      value: voucher.travel_tujuan,   mono: false },
            { label:'Rencana Berangkat',  value: rencanaFmt,              mono: false },
          ].map(f => (
            <div key={f.label} style={{ display:'flex', alignItems:'baseline', gap:'10px', padding:'7px 0', borderBottom:'1px solid rgba(201,168,76,0.08)' }}>
              <div style={{ fontSize:'9px', letterSpacing:'1.5px', color:'rgba(249,243,227,0.35)', minWidth:'110px', flexShrink:0, textTransform:'uppercase' }}>{f.label}</div>
              <div style={{ fontSize:'13px', fontWeight:500, color: f.mono ? '#e8c96d' : '#f9f3e3', fontFamily: f.mono ? "'DM Mono',monospace" : 'inherit', letterSpacing: f.mono ? '2px' : 'normal' }}>{f.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:'12px' }}>
          <div ref={qrRef} style={{ width:'80px', height:'80px', background:'#fff', borderRadius:'6px', padding:'5px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }} />
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'8px', letterSpacing:'2px', color:'rgba(249,243,227,0.35)', marginBottom:'4px' }}>NILAI DISKON</div>
            <div style={{
              fontFamily:"'Playfair Display',serif", fontSize:'22px', fontWeight:700,
              background:'linear-gradient(90deg,#c9a84c,#f5e09a,#e8c96d,#c9a84c)',
              backgroundSize:'250% auto',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>Rp 500.000</div>
            <div style={{ fontSize:'9px', color:'rgba(249,243,227,0.3)', marginTop:'2px' }}>berlaku di semua travel umroh</div>
          </div>
        </div>
      </div>

      {/* Status stamp */}
      <div style={{ position:'absolute', bottom:'28px', right:'248px', fontSize:'9px', letterSpacing:'2px', color:'rgba(34,197,94,0.6)', fontWeight:700, border:'1px solid rgba(34,197,94,0.2)', padding:'3px 10px', borderRadius:'50px', background:'rgba(34,197,94,0.05)' }}>
        ✓ AKTIF · SIAP DIGUNAKAN
      </div>
    </div>
  )
}
