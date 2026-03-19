'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Toast from '@/components/ui/Toast'
import DigitalCard from '@/components/voucher/DigitalCard'
import { getVoucherByKode } from '@/lib/supabase'
import type { Voucher } from '@/types'

interface ToastState { message: string; type: 'success'|'error'|'info' }

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '6285167060863'}`

// Demo data — akan digantikan Supabase sepenuhnya
const DEMO_DB: Record<string, Voucher> = {
  'UV-A1B2-C3D4': { id:'1', kode_unik:'UV-A1B2-C3D4', order_id:'ID.0003/II', nama_jemaah:'Siti Rahmadhani', kota_domisili:'Makassar', travel_tujuan:'Al-Furqon Travel', rencana_penggunaan:'2026-08-15', status:'active', created_at:'2026-03-01' },
  'UV-PEND-0001': { id:'2', kode_unik:'UV-PEND-0001', order_id:'ID.0007/I', nama_jemaah:'Ahmad Fauzi', kota_domisili:'Surabaya', travel_tujuan:'Berkah Umroh', rencana_penggunaan:'2026-10-20', status:'pending', created_at:'2026-03-10' },
  'UV-USED-9999': { id:'3', kode_unik:'UV-USED-9999', order_id:'ID.0001/XII', nama_jemaah:'Budi Santoso', kota_domisili:'Bandung', travel_tujuan:'Mina Tour', rencana_penggunaan:'2025-12-05', status:'used', created_at:'2025-11-01' },
}

const DEMO_CODES = [
  { code:'UV-A1B2-C3D4', label:'Aktif' },
  { code:'UV-PEND-0001', label:'Pending' },
  { code:'UV-USED-9999', label:'Terpakai' },
]

export default function TrackingPage() {
  const [code,     setCode]     = useState('')
  const [result,   setResult]   = useState<Voucher|null|'notfound'>(null)
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState<ToastState|null>(null)
  const [dlLoading,setDlLoad]   = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((message:string, type:ToastState['type']) => setToast({message,type}),[])

  async function handleSearch() {
    if (!code.trim()) return
    setLoading(true); setResult(null)
    try {
      // Try Supabase first, then demo fallback
      let voucher = await getVoucherByKode(code)
      if (!voucher) voucher = DEMO_DB[code.toUpperCase()] || null
      if (!voucher) { setResult('notfound'); showToast('Kode voucher tidak ditemukan.', 'error') }
      else {
        setResult(voucher)
        const msgs = { active:'✓ Voucher aktif ditemukan!', pending:'⏳ Voucher masih menunggu konfirmasi.', used:'Voucher ini sudah pernah digunakan.', rejected:'Voucher ditolak. Hubungi admin.' }
        const types = { active:'success' as const, pending:'info' as const, used:'info' as const, rejected:'error' as const }
        showToast(msgs[voucher.status], types[voucher.status])
      }
    } catch {
      const fallback = DEMO_DB[code.toUpperCase()] || null
      if (!fallback) { setResult('notfound'); showToast('Kode tidak ditemukan.', 'error') }
      else { setResult(fallback); showToast('✓ Voucher ditemukan!', 'success') }
    } finally { setLoading(false) }
  }

  async function handleDownload() {
    if (!cardRef.current) return
    setDlLoad(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, { scale:2, backgroundColor:null, useCORS:true, logging:false })
      const link = document.createElement('a')
      link.download = `VoucherUmroh-${code.toUpperCase().replace(/[^A-Z0-9]/g,'-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('✓ Kartu digital berhasil diunduh!', 'success')
    } catch { showToast('Gagal mengunduh. Coba lagi.', 'error') }
    finally { setDlLoad(false) }
  }

  function handleClear() { setResult(null); setCode(''); window.scrollTo({top:0,behavior:'smooth'}) }

  const isVoucher = result && result !== 'notfound'

  return (
    <>
      <div className="pattern-bg" />
      <div style={{ position:'fixed', top:'-300px', left:'50%', transform:'translateX(-50%)', width:'800px', height:'600px', background:'radial-gradient(circle,rgba(26,107,56,0.12) 0%,transparent 65%)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, padding:'100px 6% 80px', maxWidth:'860px', margin:'0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <div className="label-tag">🔍 Tracking Voucher</div>
          <h1 className="serif" style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:700, marginBottom:'12px' }}>Cek Status <span className="shimmer">Voucher Anda</span></h1>
          <p style={{ fontSize:'15px', color:'var(--cream-dim)', maxWidth:'520px', margin:'0 auto', lineHeight:1.75 }}>Masukkan kode unik voucher untuk melihat status dan mengunduh kartu digital jemaah Anda.</p>
        </div>

        {/* SEARCH BOX */}
        <div className="glass" style={{ padding:'36px 40px', marginBottom:'36px' }}>
          <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(249,243,227,0.6)', display:'block', marginBottom:'10px' }}>Kode Voucher</span>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'12px', alignItems:'center' }}>
            <input
              className="form-input mono"
              placeholder="UV-XXXX-XXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key==='Enter' && handleSearch()}
              maxLength={20}
              style={{ fontSize:'18px', letterSpacing:'3px', padding:'16px 20px' }}
            />
            <button onClick={handleSearch} disabled={loading||code.length<3}
              className="btn-gold" style={{ height:'56px', minWidth:'140px', borderRadius:'14px', fontSize:'15px' }}>
              {loading ? '⏳...' : '🔍 Cek Voucher'}
            </button>
          </div>
          <p style={{ fontSize:'12px', color:'rgba(249,243,227,0.28)', marginTop:'10px' }}>Format: UV-XXXX-XXXX · Dikirim admin via WhatsApp setelah pembayaran dikonfirmasi</p>

          <div style={{ marginTop:'16px' }}>
            <p style={{ fontSize:'11px', color:'rgba(249,243,227,0.2)', marginBottom:'8px', letterSpacing:'1px' }}>KODE DEMO — KLIK UNTUK MENCOBA:</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {DEMO_CODES.map(d => (
                <span key={d.code} onClick={()=>{ setCode(d.code); setTimeout(()=>{ document.querySelector<HTMLButtonElement>('.btn-gold')?.click() },100) }}
                  style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', padding:'5px 12px', background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'50px', color:'#c9a84c', cursor:'pointer', letterSpacing:'1px', transition:'all 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(201,168,76,0.12)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(201,168,76,0.06)')}>
                  {d.code} · {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS */}

        {/* NOT FOUND */}
        {result === 'notfound' && (
          <div style={{ background:'rgba(255,80,80,0.04)', border:'1px solid rgba(255,100,100,0.15)', borderRadius:'20px', padding:'40px', textAlign:'center', animation:'scaleIn 0.4s ease' }}>
            <div style={{ fontSize:'40px', marginBottom:'16px' }}>🔍</div>
            <div className="serif" style={{ fontSize:'22px', fontWeight:700, marginBottom:'10px', color:'rgba(255,130,130,0.85)' }}>Voucher Tidak Ditemukan</div>
            <p style={{ fontSize:'14px', color:'var(--cream-dim)', lineHeight:1.75, marginBottom:'20px' }}>Kode <strong className="mono" style={{ color:'var(--cream)', letterSpacing:'1px' }}>{code}</strong> tidak ditemukan. Pastikan kode diketik dengan benar.</p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,0.1)', color:'#25d366', padding:'12px 28px', borderRadius:'50px', border:'1.5px solid rgba(37,211,102,0.25)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>💬 Hubungi Admin</a>
              <button onClick={handleClear} className="btn-outline">Coba Kode Lain</button>
            </div>
          </div>
        )}

        {/* PENDING */}
        {isVoucher && (result as Voucher).status === 'pending' && (
          <div style={{ background:'rgba(234,179,8,0.04)', border:'1px solid rgba(234,179,8,0.2)', borderRadius:'20px', padding:'40px', textAlign:'center', animation:'scaleIn 0.4s ease' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(234,179,8,0.08)', border:'1.5px solid rgba(234,179,8,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', margin:'0 auto 20px', animation:'pendingPulse 2s ease infinite' }}>⏳</div>
            <div className="serif" style={{ fontSize:'24px', fontWeight:700, marginBottom:'10px', color:'#eab308' }}>Menunggu Konfirmasi Admin</div>
            <p style={{ fontSize:'15px', color:'var(--cream-dim)', lineHeight:1.75, marginBottom:'24px' }}>Voucher <strong className="mono" style={{ color:'#e8c96d' }}>{(result as Voucher).kode_unik}</strong> atas nama <strong>{(result as Voucher).nama_jemaah}</strong> sedang diverifikasi.<br/>Estimasi <strong style={{ color:'#eab308' }}>1×24 jam</strong> di hari kerja.</p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,0.1)', color:'#25d366', padding:'12px 28px', borderRadius:'50px', border:'1.5px solid rgba(37,211,102,0.25)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>💬 Tanya Status ke Admin</a>
              <button onClick={handleClear} className="btn-outline">Cek Kode Lain</button>
            </div>
          </div>
        )}

        {/* USED */}
        {isVoucher && (result as Voucher).status === 'used' && (
          <div style={{ background:'rgba(100,100,100,0.04)', border:'1px solid rgba(150,150,150,0.15)', borderRadius:'20px', padding:'40px', textAlign:'center', animation:'scaleIn 0.4s ease' }}>
            <div style={{ fontSize:'40px', marginBottom:'16px' }}>✓</div>
            <div className="serif" style={{ fontSize:'22px', fontWeight:700, marginBottom:'10px', color:'rgba(249,243,227,0.5)' }}>Voucher Telah Digunakan</div>
            <p style={{ fontSize:'14px', color:'rgba(249,243,227,0.35)', lineHeight:1.75, marginBottom:'24px' }}>Voucher <strong className="mono">{(result as Voucher).kode_unik}</strong> atas nama <strong>{(result as Voucher).nama_jemaah}</strong> telah berhasil digunakan. Terima kasih sudah mempercayai Voucher Umroh 🕋</p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href={process.env.NEXT_PUBLIC_PAYMENT_URL||'https://link.id'} target="_blank" rel="noopener noreferrer" className="btn-outline">🛒 Beli Voucher Baru</a>
              <button onClick={handleClear} className="btn-outline">Cek Kode Lain</button>
            </div>
          </div>
        )}

        {/* ACTIVE — DIGITAL CARD */}
        {isVoucher && (result as Voucher).status === 'active' && (
          <div style={{ animation:'cardReveal 0.5s ease forwards' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', color:'#22c55e', fontSize:'12px', fontWeight:700, padding:'6px 16px', borderRadius:'50px', letterSpacing:'0.5px' }}>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'glow 1.5s ease infinite' }} />
                VOUCHER AKTIF & SIAP DIGUNAKAN
              </div>
              <button onClick={handleDownload} disabled={dlLoading}
                style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#b8913e,#e8c96d,#b8913e)', backgroundSize:'200% auto', color:'#030f08', fontFamily:"'Tajawal',sans-serif", fontWeight:700, fontSize:'14px', padding:'10px 24px', border:'none', borderRadius:'50px', cursor:'pointer', transition:'all 0.3s', opacity:dlLoading?0.5:1 }}>
                {dlLoading ? '⏳ Menyiapkan...' : '⬇ Unduh Kartu Digital'}
              </button>
            </div>

            {/* Card Preview — scales to fit screen */}
            <div style={{ width:'100%', overflowX:'auto', borderRadius:'20px', border:'1px solid rgba(201,168,76,0.3)', boxShadow:'0 40px 80px rgba(0,0,0,0.5)', marginBottom:'20px' }}>
              <div ref={cardRef} style={{ width:'780px' }}>
                <DigitalCard voucher={result as Voucher} />
              </div>
            </div>

            {/* Info strips */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' }}>
              {[
                { label:'ORDER ID',       value:(result as Voucher).order_id,   cls:'gold' },
                { label:'TANGGAL DAFTAR', value:new Date((result as Voucher).created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}), cls:'' },
                { label:'STATUS',         value:'✓ Aktif',                       cls:'green' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:'12px', padding:'14px 16px' }}>
                  <div style={{ fontSize:'10px', letterSpacing:'1.5px', color:'rgba(249,243,227,0.3)', marginBottom:'4px' }}>{s.label}</div>
                  <div className={s.cls==='gold'?'mono':''} style={{ fontSize:'13px', fontWeight:600, color:s.cls==='gold'?'#e8c96d':s.cls==='green'?'#22c55e':'var(--cream)', letterSpacing:s.cls==='gold'?'1px':'normal' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center' }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,0.1)', color:'#25d366', padding:'12px 28px', borderRadius:'50px', border:'1.5px solid rgba(37,211,102,0.25)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>💬 Hubungi Admin</a>
              <button onClick={handleClear} className="btn-outline">🔍 Cek Kode Lain</button>
            </div>
          </div>
        )}

      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </>
  )
}
