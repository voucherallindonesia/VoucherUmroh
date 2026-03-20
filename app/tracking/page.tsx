'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Toast from '@/components/ui/Toast'
import DigitalCard from '@/components/voucher/DigitalCard'
import { getVoucherByKode, getVouchersByOrderId, getOrderById, updateVoucherData } from '@/lib/supabase'
import type { Voucher, Order } from '@/types'

type ToastState  = { message: string; type: 'success'|'error'|'info' }
type ResultMode  = 'single' | 'multi' | 'pending' | 'used' | 'notfound' | null

// Demo data fallback
const DEMO: Record<string, Voucher> = {
  'UV-A1B2-C3D4': { id:'1', kode_unik:'UV-A1B2-C3D4', order_id:'ID.0003/II', nama_jemaah:'Siti Rahmadhani', kota_domisili:'Makassar', travel_tujuan:'Al-Furqon Travel', rencana_penggunaan:'2026-08-15', status:'active', created_at:'2026-03-01' },
  'UV-PEND-0001': { id:'2', kode_unik:'UV-PEND-0001', order_id:'ID.0007/I',  nama_jemaah:'Ahmad Fauzi',    kota_domisili:'Surabaya', travel_tujuan:'Berkah Umroh',   rencana_penggunaan:'2026-10-20', status:'pending', created_at:'2026-03-10' },
  'UV-USED-9999': { id:'3', kode_unik:'UV-USED-9999', order_id:'ID.0001/XII', nama_jemaah:'Budi Santoso',  kota_domisili:'Bandung',  travel_tujuan:'Mina Tour',      rencana_penggunaan:'2025-12-05', status:'used',    created_at:'2025-11-01' },
}

const DEMO_CODES = [
  { code:'UV-A1B2-C3D4', label:'Aktif' },
  { code:'UV-PEND-0001', label:'Pending' },
  { code:'UV-USED-9999', label:'Terpakai' },
]

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '6285167060863'}`

export default function TrackingPage() {
  const [code,       setCode]      = useState('')
  const [resultMode, setMode]      = useState<ResultMode>(null)
  const [voucher,    setVoucher]   = useState<Voucher|null>(null)
  const [vouchers,   setVouchers]  = useState<Voucher[]>([])
  const [order,      setOrder]     = useState<Order|null>(null)
  const [loading,    setLoading]   = useState(false)
  const [dlLoading,  setDlLoad]    = useState<string|null>(null)
  const [toast,      setToast]     = useState<ToastState|null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement|null>>({})

  const showToast = useCallback((m:string, t:ToastState['type']) => setToast({message:m,type:t}), [])

  // ── AUTO DETECT FORMAT ────────────────────────────────────
  function detectFormat(input: string): 'order' | 'voucher' | 'unknown' {
    const v = input.trim().toUpperCase()
    if (v.startsWith('ID.') || v.startsWith('ID-')) return 'order'
    if (v.startsWith('UV-')) return 'voucher'
    // Heuristik tambahan: ada slash → kemungkinan order ID
    if (v.includes('/')) return 'order'
    return 'unknown'
  }

  async function handleSearch() {
    if (!code.trim()) return
    setLoading(true)
    setMode(null)
    const input = code.trim().toUpperCase()

    try {
      const fmt = detectFormat(input)

      if (fmt === 'order' || fmt === 'unknown') {
        // Coba cari by Order ID dulu
        const orderData = await getOrderById(input)
        if (orderData) {
          const vs = await getVouchersByOrderId(input)
          setOrder(orderData)
          setVouchers(vs)
          setMode('multi')
          showToast(`✓ Order ditemukan — ${vs.length} voucher`, 'success')
          setLoading(false)
          return
        }
      }

      if (fmt === 'voucher' || fmt === 'unknown') {
        // Coba cari by Kode Voucher
        let v = await getVoucherByKode(input)
        if (!v) v = DEMO[input] || null
        if (v) {
          setVoucher(v)
          const msgs = { active:'✓ Voucher aktif ditemukan!', pending:'⏳ Voucher menunggu konfirmasi.', used:'Voucher ini sudah pernah digunakan.', rejected:'Voucher ditolak.' }
          const types = { active:'success' as const, pending:'info' as const, used:'info' as const, rejected:'error' as const }
          setMode(v.status === 'active' ? 'single' : v.status === 'pending' ? 'pending' : 'used')
          showToast(msgs[v.status] || '—', types[v.status] || 'info')
          setLoading(false)
          return
        }
      }

      setMode('notfound')
      showToast('Kode tidak ditemukan. Periksa kembali.', 'error')
    } catch {
      // Fallback demo
      const v = DEMO[input]
      if (v) {
        setVoucher(v); setMode('single')
        showToast('✓ Voucher ditemukan!', 'success')
      } else {
        setMode('notfound')
        showToast('Kode tidak ditemukan.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(v: Voucher) {
    const ref = cardRefs.current[v.kode_unik]
    if (!ref) return
    setDlLoad(v.kode_unik)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(ref, { scale:2, backgroundColor:null, useCORS:true, logging:false })
      const link = document.createElement('a')
      link.download = `VoucherUmroh-${v.kode_unik}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('✓ Kartu berhasil diunduh!', 'success')
    } catch { showToast('Gagal mengunduh. Coba lagi.', 'error') }
    finally { setDlLoad(null) }
  }

  async function handleUpdateJemaah(v: Voucher, data: Partial<Voucher>) {
    try {
      const result = await updateVoucherData(v.kode_unik, {
        nama_jemaah:        data.nama_jemaah,
        kota_domisili:      data.kota_domisili,
        travel_tujuan:      data.travel_tujuan,
        rencana_penggunaan: data.rencana_penggunaan,
      })
      if (result.success) {
        // Update local state
        if (resultMode === 'single') setVoucher(prev => prev ? { ...prev, ...data } : prev)
        if (resultMode === 'multi')  setVouchers(prev => prev.map(pv => pv.kode_unik === v.kode_unik ? { ...pv, ...data } : pv))
        showToast('✓ Data jemaah berhasil diperbarui!', 'success')
      } else {
        showToast('Gagal menyimpan. Coba lagi.', 'error')
      }
    } catch { showToast('Gagal menyimpan.', 'error') }
  }

  function handleClear() {
    setMode(null); setCode(''); setVoucher(null); setVouchers([]); setOrder(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function tryCode(c: string) { setCode(c); setTimeout(() => handleSearch(), 100) }

  return (
    <>
      <div className="pattern-bg" />
      <div style={{ position:'fixed', top:'-300px', left:'50%', transform:'translateX(-50%)', width:'800px', height:'600px', background:'radial-gradient(circle,rgba(26,107,56,0.12) 0%,transparent 65%)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, padding:'100px 6% 80px', maxWidth:'900px', margin:'0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <div className="label-tag">🔍 Tracking Voucher</div>
          <h1 className="serif" style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:700, marginBottom:'12px' }}>
            Cek Status <span className="shimmer">Voucher Anda</span>
          </h1>
          <p style={{ fontSize:'15px', color:'var(--cream-dim)', maxWidth:'520px', margin:'0 auto', lineHeight:1.75 }}>
            Masukkan <strong style={{ color:'#e8c96d' }}>Order ID</strong> untuk melihat semua voucher, atau <strong style={{ color:'#e8c96d' }}>Kode Voucher</strong> untuk kartu spesifik.
          </p>
        </div>

        {/* SEARCH */}
        <div className="glass" style={{ padding:'36px 40px', marginBottom:'32px' }}>
          {/* Format hint */}
          <div style={{ display:'flex', gap:'16px', marginBottom:'16px', flexWrap:'wrap' }}>
            <div style={{ fontSize:'12px', color:'rgba(249,243,227,0.35)', display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', padding:'2px 8px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'4px', color:'#c9a84c' }}>ID.XXXX/XX</span>
              → Semua voucher dalam order
            </div>
            <div style={{ fontSize:'12px', color:'rgba(249,243,227,0.35)', display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', padding:'2px 8px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'4px', color:'#c9a84c' }}>UV-XXXX-XXXX</span>
              → Kartu voucher spesifik
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'12px', alignItems:'center' }}>
            <input className="form-input mono" placeholder="Ketik Order ID atau Kode Voucher..." value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ fontSize:'16px', letterSpacing:'1px', padding:'16px 20px' }} />
            <button onClick={handleSearch} disabled={loading || code.length < 3} className="btn-gold"
              style={{ height:'56px', minWidth:'140px', borderRadius:'14px', fontSize:'15px' }}>
              {loading ? '⏳...' : '🔍 Cek'}
            </button>
          </div>

          <div style={{ marginTop:'16px' }}>
            <p style={{ fontSize:'11px', color:'rgba(249,243,227,0.2)', marginBottom:'8px', letterSpacing:'1px' }}>KODE DEMO:</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {DEMO_CODES.map(d => (
                <span key={d.code} onClick={() => tryCode(d.code)}
                  style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', padding:'5px 12px', background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'50px', color:'#c9a84c', cursor:'pointer', letterSpacing:'1px', transition:'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.06)'}>
                  {d.code} · {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── NOT FOUND ── */}
        {resultMode === 'notfound' && (
          <div style={{ background:'rgba(255,80,80,0.04)', border:'1px solid rgba(255,100,100,0.15)', borderRadius:'20px', padding:'40px', textAlign:'center', animation:'scaleIn 0.4s ease' }}>
            <div style={{ fontSize:'40px', marginBottom:'16px' }}>🔍</div>
            <div className="serif" style={{ fontSize:'22px', fontWeight:700, marginBottom:'10px', color:'rgba(255,130,130,0.85)' }}>Tidak Ditemukan</div>
            <p style={{ fontSize:'14px', color:'var(--cream-dim)', lineHeight:1.75, marginBottom:'20px' }}>
              <strong className="mono" style={{ color:'var(--cream)', letterSpacing:'1px' }}>{code}</strong> tidak ditemukan. Pastikan kode diketik dengan benar.
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,0.1)', color:'#25d366', padding:'12px 24px', borderRadius:'50px', border:'1.5px solid rgba(37,211,102,0.25)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>💬 Hubungi Admin</a>
              <button onClick={handleClear} className="btn-outline">Coba Lagi</button>
            </div>
          </div>
        )}

        {/* ── PENDING ── */}
        {resultMode === 'pending' && voucher && (
          <div style={{ background:'rgba(234,179,8,0.04)', border:'1px solid rgba(234,179,8,0.2)', borderRadius:'20px', padding:'40px', textAlign:'center', animation:'scaleIn 0.4s ease' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(234,179,8,0.08)', border:'1.5px solid rgba(234,179,8,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', margin:'0 auto 20px' }}>⏳</div>
            <div className="serif" style={{ fontSize:'24px', fontWeight:700, marginBottom:'10px', color:'#eab308' }}>Menunggu Konfirmasi</div>
            <p style={{ fontSize:'15px', color:'var(--cream-dim)', lineHeight:1.75, marginBottom:'24px' }}>
              Voucher <strong className="mono" style={{ color:'#e8c96d' }}>{voucher.kode_unik}</strong> atas nama <strong>{voucher.nama_jemaah || '—'}</strong> sedang diverifikasi.<br/>Estimasi <strong style={{ color:'#eab308' }}>1×24 jam</strong> di hari kerja.
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,0.1)', color:'#25d366', padding:'12px 24px', borderRadius:'50px', border:'1.5px solid rgba(37,211,102,0.25)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>💬 Tanya Status</a>
              <button onClick={handleClear} className="btn-outline">Cek Lain</button>
            </div>
          </div>
        )}

        {/* ── USED ── */}
        {resultMode === 'used' && voucher && (
          <div style={{ background:'rgba(100,100,100,0.04)', border:'1px solid rgba(150,150,150,0.15)', borderRadius:'20px', padding:'40px', textAlign:'center', animation:'scaleIn 0.4s ease' }}>
            <div style={{ fontSize:'40px', marginBottom:'16px' }}>✓</div>
            <div className="serif" style={{ fontSize:'22px', fontWeight:700, marginBottom:'10px', color:'rgba(249,243,227,0.5)' }}>Voucher Telah Digunakan</div>
            <p style={{ fontSize:'14px', color:'rgba(249,243,227,0.35)', lineHeight:1.75, marginBottom:'24px' }}>
              Voucher <strong className="mono">{voucher.kode_unik}</strong> atas nama <strong>{voucher.nama_jemaah}</strong> telah berhasil digunakan. Terima kasih 🕋
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href={process.env.NEXT_PUBLIC_PAYMENT_URL||'https://link.id'} target="_blank" rel="noopener noreferrer" className="btn-outline">🛒 Beli Lagi</a>
              <button onClick={handleClear} className="btn-outline">Cek Lain</button>
            </div>
          </div>
        )}

        {/* ── SINGLE VOUCHER (UV-XXXX) ── */}
        {resultMode === 'single' && voucher && (
          <SingleVoucherResult voucher={voucher} cardRefs={cardRefs} dlLoading={dlLoading}
            onDownload={handleDownload} onUpdate={handleUpdateJemaah} onClear={handleClear} showToast={showToast} />
        )}

        {/* ── MULTI VOUCHER (ORDER ID) ── */}
        {resultMode === 'multi' && order && (
          <MultiVoucherResult order={order} vouchers={vouchers} cardRefs={cardRefs} dlLoading={dlLoading}
            onDownload={handleDownload} onUpdate={handleUpdateJemaah} onClear={handleClear} showToast={showToast} />
        )}

      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

// ══ SINGLE VOUCHER RESULT ═════════════════════════════════════
function SingleVoucherResult({ voucher, cardRefs, dlLoading, onDownload, onUpdate, onClear, showToast }: any) {
  const createdFmt = new Date(voucher.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
  return (
    <div style={{ animation:'cardReveal 0.5s ease forwards' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', color:'#22c55e', fontSize:'12px', fontWeight:700, padding:'6px 16px', borderRadius:'50px', letterSpacing:'0.5px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'glow 1.5s ease infinite' }} />
          VOUCHER AKTIF
        </div>
        <button onClick={() => onDownload(voucher)} disabled={dlLoading === voucher.kode_unik}
          style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#b8913e,#e8c96d,#b8913e)', backgroundSize:'200% auto', color:'#030f08', fontFamily:"'Tajawal',sans-serif", fontWeight:700, fontSize:'14px', padding:'10px 24px', border:'none', borderRadius:'50px', cursor:'pointer', transition:'all 0.3s', opacity:dlLoading===voucher.kode_unik?0.5:1 }}>
          {dlLoading === voucher.kode_unik ? '⏳ Menyiapkan...' : '⬇ Unduh Kartu'}
        </button>
      </div>

      <div style={{ width:'100%', overflowX:'auto', borderRadius:'20px', border:'1px solid rgba(201,168,76,0.3)', boxShadow:'0 40px 80px rgba(0,0,0,0.5)', marginBottom:'16px' }}>
        <div ref={(el) => { cardRefs.current[voucher.kode_unik] = el }} style={{ width:'780px' }}>
          <DigitalCard voucher={voucher} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'ORDER ID',       value: voucher.order_id,   mono: true },
          { label:'TERDAFTAR',      value: createdFmt,         mono: false },
          { label:'STATUS',         value: '✓ Aktif',          mono: false, green: true },
        ].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:'12px', padding:'14px 16px' }}>
            <div style={{ fontSize:'10px', letterSpacing:'1.5px', color:'rgba(249,243,227,0.3)', marginBottom:'4px' }}>{s.label}</div>
            <div className={s.mono?'mono':''} style={{ fontSize:'13px', fontWeight:600, color:s.green?'#22c55e':s.mono?'#e8c96d':'var(--cream)', letterSpacing:s.mono?'1px':'normal' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Edit data jemaah jika kosong */}
      <EditDataJemaah voucher={voucher} onSave={data => onUpdate(voucher, data)} showToast={showToast} />

      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginTop:'16px' }}>
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER||'6285167060863'}`} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,0.1)', color:'#25d366', padding:'12px 24px', borderRadius:'50px', border:'1.5px solid rgba(37,211,102,0.25)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>💬 Hubungi Admin</a>
        <button onClick={onClear} className="btn-outline">🔍 Cek Lain</button>
      </div>
    </div>
  )
}

// ══ MULTI VOUCHER RESULT (ORDER ID) ═══════════════════════════
function MultiVoucherResult({ order, vouchers, cardRefs, dlLoading, onDownload, onUpdate, onClear, showToast }: any) {
  const [expanded, setExpanded] = useState<string|null>(null)

  const statusColor = (s:string) => ({ pending:'#eab308', active:'#22c55e', used:'rgba(249,243,227,0.4)', rejected:'rgba(255,130,130,0.8)' }[s]||'#888')
  const statusLabel = (s:string) => ({ pending:'⏳ Pending', active:'✓ Aktif', used:'✓ Terpakai', rejected:'✗ Ditolak' }[s]||s)

  return (
    <div style={{ animation:'cardReveal 0.5s ease forwards' }}>
      {/* Order summary */}
      <div style={{ background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:'16px', padding:'20px 24px', marginBottom:'24px' }}>
        <div style={{ fontSize:'12px', color:'rgba(249,243,227,0.35)', letterSpacing:'1.5px', marginBottom:'10px' }}>DETAIL ORDER</div>
        <div style={{ display:'flex', gap:'32px', flexWrap:'wrap' }}>
          {[
            { label:'Order ID',    value: order.order_id, mono: true },
            { label:'Pembeli',     value: order.nama_pembeli },
            { label:'WhatsApp',    value: order.no_whatsapp },
            { label:'Total Voucher', value: `${order.jumlah_voucher} jemaah` },
            { label:'Status Order',  value: order.status === 'active' ? '✓ Aktif' : '⏳ Pending', green: order.status === 'active' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize:'11px', color:'rgba(249,243,227,0.35)', marginBottom:'3px' }}>{f.label}</div>
              <div className={(f as any).mono?'mono':''} style={{ fontSize:'14px', fontWeight:600, color:(f as any).green?'#22c55e':(f as any).mono?'#e8c96d':'var(--cream)' }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voucher list */}
      <div style={{ marginBottom:'8px', fontSize:'13px', color:'rgba(249,243,227,0.35)', letterSpacing:'1.5px' }}>DAFTAR VOUCHER ({vouchers.length})</div>

      {vouchers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px', color:'rgba(249,243,227,0.25)', fontSize:'14px' }}>Belum ada voucher terdaftar untuk order ini.</div>
      ) : vouchers.map((v: Voucher) => (
        <div key={v.id} style={{ border:`1px solid ${v.status==='active'?'rgba(34,197,94,0.15)':'rgba(201,168,76,0.1)'}`, borderRadius:'16px', marginBottom:'12px', overflow:'hidden' }}>
          {/* Card header */}
          <div onClick={() => setExpanded(expanded === v.kode_unik ? null : v.kode_unik)}
            style={{ display:'flex', alignItems:'center', gap:'14px', padding:'16px 20px', background: v.status==='active'?'rgba(34,197,94,0.04)':'rgba(13,61,30,0.4)', cursor:'pointer', flexWrap:'wrap' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:'12px', minWidth:'200px' }}>
              <div className="mono" style={{ fontSize:'14px', color:'#e8c96d', letterSpacing:'1px', fontWeight:700 }}>{v.kode_unik}</div>
              <span style={{ fontSize:'12px', padding:'3px 10px', borderRadius:'50px', background:'rgba('+statusColor(v.status).replace('#','')+',0.1)', border:`1px solid ${statusColor(v.status)}44`, color:statusColor(v.status), fontWeight:600 }}>{statusLabel(v.status)}</span>
            </div>
            <div style={{ fontSize:'14px', color: v.nama_jemaah?'var(--cream)':'rgba(249,243,227,0.3)' }}>{v.nama_jemaah || 'Data belum diisi'}</div>
            {v.status === 'active' && (
              <button onClick={e => { e.stopPropagation(); onDownload(v) }} disabled={dlLoading===v.kode_unik}
                style={{ background:'linear-gradient(135deg,#b8913e,#e8c96d)', color:'#030f08', border:'none', borderRadius:'8px', padding:'7px 14px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal',sans-serif", flexShrink:0 }}>
                {dlLoading===v.kode_unik?'⏳...':'⬇ Unduh'}
              </button>
            )}
            <span style={{ color:'rgba(249,243,227,0.3)', fontSize:'16px', transition:'transform 0.3s', display:'inline-block', transform:expanded===v.kode_unik?'rotate(180deg)':'none', flexShrink:0 }}>▾</span>
          </div>

          {/* Card expanded — Digital Card */}
          {expanded === v.kode_unik && v.status === 'active' && (
            <div style={{ padding:'20px', background:'rgba(0,0,0,0.2)' }}>
              <div style={{ width:'100%', overflowX:'auto', borderRadius:'16px', border:'1px solid rgba(201,168,76,0.2)', marginBottom:'16px' }}>
                <div ref={el => { cardRefs.current[v.kode_unik] = el }} style={{ width:'780px' }}>
                  <DigitalCard voucher={v} />
                </div>
              </div>
              <EditDataJemaah voucher={v} onSave={data => onUpdate(v, data)} showToast={showToast} />
            </div>
          )}

          {/* Card expanded — Pending */}
          {expanded === v.kode_unik && v.status === 'pending' && (
            <div style={{ padding:'20px', background:'rgba(0,0,0,0.2)', fontSize:'14px', color:'rgba(249,243,227,0.5)' }}>
              ⏳ Voucher ini sedang menunggu konfirmasi admin. Estimasi 1×24 jam di hari kerja.
            </div>
          )}
        </div>
      ))}

      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginTop:'20px' }}>
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER||'6285167060863'}`} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,211,102,0.1)', color:'#25d366', padding:'12px 24px', borderRadius:'50px', border:'1.5px solid rgba(37,211,102,0.25)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>💬 Hubungi Admin</a>
        <button onClick={onClear} className="btn-outline">🔍 Cek Lain</button>
      </div>
    </div>
  )
}

// ══ EDIT DATA JEMAAH ══════════════════════════════════════════
function EditDataJemaah({ voucher, onSave, showToast }: { voucher: Voucher; onSave:(d:any)=>void; showToast:(m:string,t:any)=>void }) {
  const isEmpty = !voucher.nama_jemaah && !voucher.kota_domisili && !voucher.travel_tujuan
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nama_jemaah: voucher.nama_jemaah||'', kota_domisili: voucher.kota_domisili||'', travel_tujuan: voucher.travel_tujuan||'', rencana_penggunaan: voucher.rencana_penggunaan||'' })
  const labelStyle: React.CSSProperties = { display:'block', fontSize:'13px', fontWeight:600, color:'rgba(249,243,227,0.65)', marginBottom:'8px' }

  async function handleSave() {
    if (!form.nama_jemaah) { showToast('Nama jemaah wajib diisi.', 'error'); return }
    setSaving(true)
    await onSave(form)
    setSaving(false)
    setOpen(false)
  }

  return (
    <div style={{ marginTop:'8px' }}>
      {isEmpty && !open && (
        <div style={{ background:'rgba(234,179,8,0.06)', border:'1px solid rgba(234,179,8,0.2)', borderRadius:'12px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
          <span style={{ fontSize:'16px' }}>📝</span>
          <div style={{ flex:1, fontSize:'14px', color:'rgba(249,243,227,0.5)' }}>Data jemaah belum diisi — lengkapi agar kartu terlihat lengkap.</div>
          <button onClick={() => setOpen(true)} style={{ background:'rgba(234,179,8,0.12)', border:'1px solid rgba(234,179,8,0.3)', color:'#eab308', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Tajawal',sans-serif", whiteSpace:'nowrap' }}>Isi Sekarang</button>
        </div>
      )}
      {!isEmpty && !open && (
        <div style={{ textAlign:'center' }}>
          <button onClick={() => setOpen(true)} style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.2)', color:'rgba(249,243,227,0.4)', borderRadius:'8px', padding:'7px 18px', fontSize:'13px', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(201,168,76,0.5)';e.currentTarget.style.color='#e8c96d'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(201,168,76,0.2)';e.currentTarget.style.color='rgba(249,243,227,0.4)'}}>
            ✏️ Edit Data Jemaah
          </button>
        </div>
      )}
      {open && (
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'14px', padding:'24px', marginTop:'8px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'17px', fontWeight:600, color:'#e8c96d' }}>{isEmpty ? '📝 Lengkapi Data' : '✏️ Edit Data Jemaah'}</div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'rgba(249,243,227,0.3)', fontSize:'18px', cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
            <div><label style={labelStyle}>Nama Lengkap <span style={{color:'#c9a84c'}}>*</span></label><input className="form-input" placeholder="Nama sesuai paspor" value={form.nama_jemaah} onChange={e=>setForm(f=>({...f,nama_jemaah:e.target.value}))} /></div>
            <div><label style={labelStyle}>Kota Domisili</label><input className="form-input" placeholder="Contoh: Makassar" value={form.kota_domisili} onChange={e=>setForm(f=>({...f,kota_domisili:e.target.value}))} /></div>
          </div>
          <div style={{marginBottom:'14px'}}><label style={labelStyle}>Travel Tujuan</label><input className="form-input" placeholder="Nama travel umroh" value={form.travel_tujuan} onChange={e=>setForm(f=>({...f,travel_tujuan:e.target.value}))} /></div>
          <div style={{marginBottom:'20px'}}><label style={labelStyle}>Rencana Penggunaan</label><input className="form-input" type="date" value={form.rencana_penggunaan} onChange={e=>setForm(f=>({...f,rencana_penggunaan:e.target.value}))} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'10px'}}>
            <button onClick={()=>setOpen(false)} className="btn-outline">Batal</button>
            <button onClick={handleSave} disabled={saving} className="btn-gold">{saving?'⏳ Menyimpan...':'💾 Simpan Data'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
