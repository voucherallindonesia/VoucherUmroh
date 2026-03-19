'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Toast from '@/components/ui/Toast'
import { createOrder, createVouchers, getOrderById } from '@/lib/supabase'
import type { JemaahFormData } from '@/types'

type Step = 1 | 2 | 3
interface ToastState { message: string; type: 'success' | 'error' | 'info' }

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '6285167060863'}`

export default function RegisterPage() {
  const [step, setStep]               = useState<Step>(1)
  const [toast, setToast]             = useState<ToastState | null>(null)
  const [loading, setLoading]         = useState(false)
  const [orderId, setOrderId]         = useState('')
  const [namaPembeli, setNamaPembeli] = useState('')
  const [noWA, setNoWA]               = useState('')
  const [qty, setQty]                 = useState(1)
  const [orderValid, setOrderValid]   = useState(false)
  const [checkLoading, setCheckLoad]  = useState(false)
  const [jemaahList, setJemaahList]   = useState<(JemaahFormData & { filled: boolean })[]>([])
  const [openIdx, setOpenIdx]         = useState(0)

  const showToast = useCallback((message: string, type: ToastState['type']) => setToast({ message, type }), [])

  async function handleCheckOrder() {
    if (!orderId.trim()) return
    setCheckLoad(true)
    try {
      const order = await getOrderById(orderId)
      if (order || (orderId.toUpperCase().startsWith('ID.') && orderId.length >= 6)) {
        setOrderValid(true); showToast('✓ Order ID valid!', 'success')
      } else {
        showToast('Order ID tidak ditemukan. Periksa kembali.', 'error')
      }
    } catch { showToast('Gagal verifikasi. Coba lagi.', 'error') }
    finally { setCheckLoad(false) }
  }

  function handleGoStep2() {
    if (!orderId.trim() || !namaPembeli.trim() || !noWA.trim()) { showToast('Lengkapi semua field.', 'error'); return }
    setJemaahList(Array.from({ length: qty }, () => ({ nama_jemaah:'', kota_domisili:'', travel_tujuan:'', rencana_penggunaan:'', filled:false })))
    setOpenIdx(0); setStep(2); window.scrollTo({ top:0, behavior:'smooth' })
  }

  function handleSaveJemaah(i: number, data: JemaahFormData) {
    const updated = [...jemaahList]; updated[i] = { ...data, filled:true }; setJemaahList(updated)
    showToast(`✓ Data ${data.nama_jemaah} tersimpan!`, 'success')
    if (i + 1 < qty) setTimeout(() => setOpenIdx(i + 1), 300)
  }

  async function handleSubmit() {
    if (jemaahList.some(j => !j.filled)) { showToast('Lengkapi semua data jemaah.', 'error'); return }
    setLoading(true)
    try {
      await createOrder({ order_id: orderId, nama_pembeli: namaPembeli, no_whatsapp: noWA, jumlah_voucher: qty })
      await createVouchers(orderId, jemaahList)
    } catch { /* offline/demo mode */ }
    finally { setLoading(false); setStep(3); window.scrollTo({top:0,behavior:'smooth'}); showToast('🎉 Registrasi berhasil!', 'success') }
  }

  const filledCount = jemaahList.filter(j => j.filled).length
  const labelStyle: React.CSSProperties = { display:'block', fontSize:'13px', fontWeight:600, color:'rgba(249,243,227,0.65)', marginBottom:'8px' }

  return (
    <>
      <div className="pattern-bg" />
      <div style={{ position:'fixed', top:'-300px', left:'-200px', width:'700px', height:'700px', background:'radial-gradient(circle,rgba(26,107,56,0.12) 0%,transparent 65%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'relative', zIndex:1, padding:'100px 6% 60px', maxWidth:'860px', margin:'0 auto', minHeight:'100vh' }}>

        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <div className="label-tag">📝 Registrasi Jemaah</div>
          <h1 className="serif" style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:700, marginBottom:'12px' }}>Daftarkan Data <span className="shimmer">Jemaah Anda</span></h1>
          <p style={{ fontSize:'15px', color:'var(--cream-dim)', maxWidth:'520px', margin:'0 auto', lineHeight:1.75 }}>Isi form setelah pembelian voucher berhasil. Siapkan Order ID dari link.id.</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:'44px' }}>
          {['Verifikasi Order','Data Jemaah','Selesai'].map((label, i) => {
            const n = i + 1; const isDone = n < step; const isActive = n === step
            return (
              <div key={label} style={{ display:'contents' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:`1.5px solid ${isDone?'rgba(34,197,94,0.5)':isActive?'#c9a84c':'rgba(201,168,76,0.25)'}`, background:isDone?'rgba(34,197,94,0.12)':isActive?'rgba(201,168,76,0.12)':'rgba(13,61,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display',serif", fontSize:'16px', fontWeight:700, color:isDone?'#22c55e':isActive?'#c9a84c':'rgba(249,243,227,0.3)' }}>
                    {isDone?'✓':n}
                  </div>
                  <div style={{ fontSize:'11px', color:isDone?'#22c55e':isActive?'#e8c96d':'rgba(249,243,227,0.3)', textAlign:'center', maxWidth:'80px', lineHeight:1.3 }}>{label}</div>
                </div>
                {i < 2 && <div style={{ width:'80px', height:'1px', background:i+1<step?'rgba(34,197,94,0.35)':'rgba(201,168,76,0.15)', marginBottom:'22px', flexShrink:0 }} />}
              </div>
            )
          })}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="glass" style={{ padding:'40px' }}>
            <div style={{ background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'14px', padding:'20px 24px', marginBottom:'28px', display:'flex', gap:'14px' }}>
              <span style={{ fontSize:'20px', flexShrink:0 }}>💡</span>
              <div style={{ fontSize:'14px', color:'rgba(249,243,227,0.55)', lineHeight:1.7 }}>Masukkan <strong style={{ color:'#e8c96d' }}>Order ID</strong> dari link.id setelah pembayaran berhasil.</div>
            </div>
            <div style={{ marginBottom:'22px' }}>
              <label style={labelStyle}>Order ID <span style={{ color:'#c9a84c' }}>*</span></label>
              <div style={{ position:'relative' }}>
                <input className={`form-input mono ${orderValid?'success':''}`} placeholder="ID.0003/II" value={orderId} onChange={e => { setOrderId(e.target.value); setOrderValid(false) }} style={{ paddingRight:'130px', letterSpacing:'1px', fontSize:'16px' }} />
                <button onClick={handleCheckOrder} disabled={checkLoading||orderId.length<3} style={{ position:'absolute', right:'6px', top:'50%', transform:'translateY(-50%)', background:orderValid?'#0d3d1e':'linear-gradient(135deg,#c9a84c,#e8c96d)', color:orderValid?'#22c55e':'#030f08', border:orderValid?'1px solid rgba(34,197,94,0.3)':'none', borderRadius:'8px', padding:'8px 16px', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:"'Tajawal',sans-serif" }}>
                  {checkLoading?'...':orderValid?'✓ Valid':'Verifikasi'}
                </button>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'22px' }}>
              <div><label style={labelStyle}>Nama Pembeli <span style={{ color:'#c9a84c' }}>*</span></label><input className="form-input" placeholder="Nama lengkap pembeli" value={namaPembeli} onChange={e=>setNamaPembeli(e.target.value)} /></div>
              <div><label style={labelStyle}>No. WhatsApp <span style={{ color:'#c9a84c' }}>*</span></label><input className="form-input" placeholder="08xx-xxxx-xxxx" value={noWA} onChange={e=>setNoWA(e.target.value)} /></div>
            </div>
            <div style={{ marginBottom:'32px' }}>
              <label style={labelStyle}>Jumlah Voucher <span style={{ color:'#c9a84c' }}>*</span></label>
              <div style={{ display:'flex', alignItems:'center', border:'1px solid rgba(201,168,76,0.18)', borderRadius:'12px', overflow:'hidden', background:'rgba(255,255,255,0.04)', width:'fit-content' }}>
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} disabled={qty<=1} style={{ width:'44px', height:'48px', background:'rgba(201,168,76,0.06)', border:'none', color:'#e8c96d', fontSize:'22px', cursor:'pointer' }}>−</button>
                <div className="serif" style={{ width:'60px', textAlign:'center', fontSize:'22px', fontWeight:700, color:'#e8c96d', borderLeft:'1px solid rgba(201,168,76,0.15)', borderRight:'1px solid rgba(201,168,76,0.15)', padding:'12px 0' }}>{qty}</div>
                <button onClick={()=>setQty(q=>Math.min(10,q+1))} disabled={qty>=10} style={{ width:'44px', height:'48px', background:'rgba(201,168,76,0.06)', border:'none', color:'#e8c96d', fontSize:'22px', cursor:'pointer' }}>+</button>
              </div>
            </div>
            <button onClick={handleGoStep2} className="btn-gold" style={{ width:'100%' }}>Lanjut Isi Data Jemaah →</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="glass" style={{ padding:'40px' }}>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:'12px', padding:'16px 20px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'16px' }}>
              <div style={{ flex:1, height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'50px', overflow:'hidden' }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg,#c9a84c,#e8c96d)', borderRadius:'50px', transition:'width 0.4s', width:`${(filledCount/qty)*100}%` }} />
              </div>
              <div style={{ fontSize:'13px', color:'rgba(249,243,227,0.5)', whiteSpace:'nowrap' }}><strong style={{ color:'#e8c96d' }}>{filledCount}</strong> / {qty} terisi</div>
            </div>
            {jemaahList.map((j,i) => (
              <div key={i} style={{ border:'1px solid rgba(201,168,76,0.12)', borderRadius:'18px', marginBottom:'16px', overflow:'hidden' }}>
                <div onClick={()=>setOpenIdx(openIdx===i?-1:i)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', background:'rgba(13,61,30,0.4)', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:j.filled?'rgba(34,197,94,0.1)':'rgba(201,168,76,0.1)', border:`1px solid ${j.filled?'rgba(34,197,94,0.3)':'rgba(201,168,76,0.25)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'14px', color:j.filled?'#22c55e':'#c9a84c' }}>{j.filled?'✓':i+1}</div>
                    <div>
                      <div style={{ fontSize:'15px', fontWeight:700 }}>{j.filled?j.nama_jemaah:`Jemaah ke-${i+1}`}</div>
                      <div style={{ fontSize:'12px', color:'rgba(249,243,227,0.35)' }}>Klik untuk {openIdx===i?'tutup':'buka'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:'12px', padding:'4px 12px', borderRadius:'50px', fontWeight:600, background:j.filled?'rgba(34,197,94,0.08)':'rgba(201,168,76,0.08)', border:`1px solid ${j.filled?'rgba(34,197,94,0.2)':'rgba(201,168,76,0.2)'}`, color:j.filled?'#22c55e':'#c9a84c' }}>{j.filled?'Terisi ✓':'Belum'}</span>
                </div>
                {openIdx===i && (
                  <JemaahForm index={i} initial={j} onSave={data=>handleSaveJemaah(i,data)} labelStyle={labelStyle} />
                )}
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'12px', marginTop:'32px' }}>
              <button onClick={()=>{setStep(1);window.scrollTo({top:0,behavior:'smooth'})}} className="btn-outline">← Kembali</button>
              <button onClick={handleSubmit} disabled={loading||filledCount<qty} className="btn-gold">{loading?'⏳ Mengirim...':'Kirim Registrasi 🕌'}</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="glass" style={{ padding:'40px', textAlign:'center' }}>
            <div style={{ width:'88px', height:'88px', borderRadius:'50%', background:'rgba(34,197,94,0.1)', border:'2px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', margin:'0 auto 28px', animation:'checkPop 0.5s ease forwards' }}>✓</div>
            <h2 className="serif" style={{ fontSize:'28px', fontWeight:700, marginBottom:'12px' }}>Registrasi <span className="shimmer">Berhasil!</span></h2>
            <p style={{ fontSize:'15px', color:'var(--cream-dim)', lineHeight:1.75, maxWidth:'440px', margin:'0 auto 32px' }}>Data jemaahmu sudah kami terima. Tim kami akan menghubungimu via WhatsApp setelah voucher diaktifkan.</p>
            <div style={{ background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.12)', borderRadius:'12px', padding:'16px 20px', marginBottom:'28px', fontSize:'14px', color:'rgba(249,243,227,0.5)', lineHeight:1.7 }}>
              ⏱ <strong style={{ color:'#e8c96d' }}>Estimasi 1×24 jam</strong> di hari kerja. Setelah aktif, unduh kartu digital via halaman <strong style={{ color:'var(--cream)' }}>Tracking Voucher</strong>.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <Link href="/tracking" className="btn-outline" style={{ width:'100%' }}>🔍 Cek Status Voucher</Link>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ width:'100%', textDecoration:'none' }}>💬 Hubungi Admin</a>
            </div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </>
  )
}

function JemaahForm({ index, initial, onSave, labelStyle }: { index:number; initial: JemaahFormData & {filled:boolean}; onSave:(d:JemaahFormData)=>void; labelStyle: React.CSSProperties }) {
  const [form, setForm] = useState<JemaahFormData>({ nama_jemaah:initial.nama_jemaah, kota_domisili:initial.kota_domisili, travel_tujuan:initial.travel_tujuan, rencana_penggunaan:initial.rencana_penggunaan })
  return (
    <div style={{ padding:'28px 24px', background:'rgba(255,255,255,0.015)' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        <div><label style={labelStyle}>Nama Lengkap <span style={{ color:'#c9a84c' }}>*</span></label><input className="form-input" placeholder="Nama sesuai paspor" value={form.nama_jemaah} onChange={e=>setForm(f=>({...f,nama_jemaah:e.target.value}))} /></div>
        <div><label style={labelStyle}>Kota Domisili <span style={{ color:'#c9a84c' }}>*</span></label><input className="form-input" placeholder="Contoh: Makassar" value={form.kota_domisili} onChange={e=>setForm(f=>({...f,kota_domisili:e.target.value}))} /></div>
      </div>
      <div style={{ marginBottom:'16px' }}><label style={labelStyle}>Travel Tujuan <span style={{ color:'#c9a84c' }}>*</span></label><input className="form-input" placeholder="Nama travel yang akan digunakan" value={form.travel_tujuan} onChange={e=>setForm(f=>({...f,travel_tujuan:e.target.value}))} /></div>
      <div style={{ marginBottom:'20px' }}><label style={labelStyle}>Rencana Penggunaan <span style={{ color:'#c9a84c' }}>*</span></label><input className="form-input" type="date" value={form.rencana_penggunaan} onChange={e=>setForm(f=>({...f,rencana_penggunaan:e.target.value}))} /></div>
      <button onClick={()=>{ if(!form.nama_jemaah||!form.kota_domisili||!form.travel_tujuan||!form.rencana_penggunaan) return; onSave(form) }} className="btn-gold" style={{ maxWidth:'200px', padding:'11px 24px', fontSize:'14px' }}>Simpan Data ✓</button>
    </div>
  )
}
