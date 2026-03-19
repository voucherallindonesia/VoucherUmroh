'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminLoggedIn, clearAdminSession, getAllOrders, getVouchersByOrderId, getDashboardStats, activateOrder, rejectOrder, markVoucherUsed } from '@/lib/admin'
import type { Order, Voucher } from '@/types'

type TabType = 'orders' | 'vouchers'
type ToastState = { message: string; type: 'success'|'error'|'info' }

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tab,          setTab]         = useState<TabType>('orders')
  const [orders,       setOrders]      = useState<Order[]>([])
  const [expandedOrder,setExpanded]    = useState<string|null>(null)
  const [orderVouchers,setOVouchers]   = useState<Record<string,Voucher[]>>({})
  const [stats,        setStats]       = useState({ totalOrders:0, pendingOrders:0, activeOrders:0, totalVouchers:0, activeVouchers:0, usedVouchers:0 })
  const [loading,      setLoading]     = useState(true)
  const [actionLoading,setActLoading]  = useState<string|null>(null)
  const [toast,        setToast]       = useState<ToastState|null>(null)
  const [filterStatus, setFilter]      = useState<string>('all')
  const [searchQ,      setSearch]      = useState('')

  // ── AUTH CHECK ──────────────────────────────────
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login')
      return
    }
    fetchData()
  }, [])

  // ── FETCH DATA ───────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersData, statsData] = await Promise.all([
        getAllOrders(),
        getDashboardStats(),
      ])
      setOrders(ordersData)
      setStats(statsData)
    } catch {
      showToast('Gagal memuat data. Cek koneksi internet.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── EXPAND ORDER → LOAD VOUCHERS ─────────────────
  async function toggleExpand(orderId: string) {
    if (expandedOrder === orderId) { setExpanded(null); return }
    setExpanded(orderId)
    if (!orderVouchers[orderId]) {
      try {
        const v = await getVouchersByOrderId(orderId)
        setOVouchers(prev => ({ ...prev, [orderId]: v }))
      } catch { showToast('Gagal memuat voucher.', 'error') }
    }
  }

  // ── ACTIVATE ─────────────────────────────────────
  async function handleActivate(orderId: string) {
    setActLoading(orderId + '_activate')
    const result = await activateOrder(orderId)
    if (result.success) {
      showToast(`✓ Order ${orderId} berhasil diaktifkan!`, 'success')
      await fetchData()
      // refresh expanded vouchers
      if (expandedOrder === orderId) {
        const v = await getVouchersByOrderId(orderId)
        setOVouchers(prev => ({ ...prev, [orderId]: v }))
      }
    } else {
      showToast('Gagal mengaktifkan. Coba lagi.', 'error')
    }
    setActLoading(null)
  }

  // ── REJECT ───────────────────────────────────────
  async function handleReject(orderId: string) {
    if (!confirm(`Yakin ingin menolak order ${orderId}?`)) return
    setActLoading(orderId + '_reject')
    const result = await rejectOrder(orderId)
    if (result.success) {
      showToast(`Order ${orderId} ditolak.`, 'info')
      await fetchData()
    } else {
      showToast('Gagal menolak. Coba lagi.', 'error')
    }
    setActLoading(null)
  }

  // ── MARK USED ────────────────────────────────────
  async function handleMarkUsed(kode: string, orderId: string) {
    if (!confirm(`Tandai voucher ${kode} sebagai sudah digunakan?`)) return
    setActLoading(kode + '_used')
    const result = await markVoucherUsed(kode)
    if (result.success) {
      showToast(`Voucher ${kode} ditandai terpakai.`, 'success')
      const v = await getVouchersByOrderId(orderId)
      setOVouchers(prev => ({ ...prev, [orderId]: v }))
      await fetchData()
    } else {
      showToast('Gagal. Coba lagi.', 'error')
    }
    setActLoading(null)
  }

  // ── LOGOUT ───────────────────────────────────────
  function handleLogout() {
    clearAdminSession()
    router.replace('/admin/login')
  }

  // ── TOAST ────────────────────────────────────────
  function showToast(message: string, type: ToastState['type']) {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── FILTERED ORDERS ──────────────────────────────
  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch = !searchQ || o.order_id.toLowerCase().includes(searchQ.toLowerCase()) || o.nama_pembeli.toLowerCase().includes(searchQ.toLowerCase())
    return matchStatus && matchSearch
  })

  // ── STATUS HELPERS ───────────────────────────────
  const statusColor = (s: string) => ({ pending:'#eab308', active:'#22c55e', rejected:'rgba(255,100,100,0.85)', completed:'#60a5fa' }[s] || '#888')
  const statusBg    = (s: string) => ({ pending:'rgba(234,179,8,0.1)', active:'rgba(34,197,94,0.1)', rejected:'rgba(255,80,80,0.1)', completed:'rgba(96,165,250,0.1)' }[s] || 'rgba(255,255,255,0.05)')
  const statusLabel = (s: string) => ({ pending:'⏳ Pending', active:'✓ Aktif', rejected:'✗ Ditolak', completed:'✓ Selesai' }[s] || s)

  return (
    <div style={{ minHeight:'100vh', background:'var(--green-deep)', fontFamily:"'Tajawal',sans-serif", color:'var(--cream)' }}>
      <div className="pattern-bg" />

      {/* ══ TOPBAR ══ */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(2,8,4,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(201,168,76,0.1)', padding:'0 6%', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'32px', height:'32px', background:'linear-gradient(135deg,#c9a84c,#e8c96d)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🕋</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'16px', color:'#e8c96d' }}>Voucher Umroh</div>
            <div style={{ fontSize:'10px', color:'rgba(249,243,227,0.35)', letterSpacing:'2px' }}>ADMIN PANEL</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button onClick={fetchData} style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', color:'#e8c96d', borderRadius:'8px', padding:'7px 14px', fontSize:'13px', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", transition:'all 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(201,168,76,0.15)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(201,168,76,0.08)')}>
            🔄 Refresh
          </button>
          <button onClick={handleLogout} style={{ background:'rgba(255,80,80,0.08)', border:'1px solid rgba(255,100,100,0.2)', color:'rgba(255,130,130,0.85)', borderRadius:'8px', padding:'7px 14px', fontSize:'13px', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", transition:'all 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,80,80,0.15)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,80,80,0.08)')}>
            🚪 Keluar
          </button>
        </div>
      </div>

      <div style={{ padding:'32px 6%', maxWidth:'1280px', margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* ══ STATS CARDS ══ */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'12px', marginBottom:'32px' }} className="stats-grid">
          {[
            { label:'Total Order',    value:stats.totalOrders,    color:'#c9a84c',  bg:'rgba(201,168,76,0.08)',   border:'rgba(201,168,76,0.2)' },
            { label:'Perlu Verifikasi',value:stats.pendingOrders, color:'#eab308',  bg:'rgba(234,179,8,0.08)',    border:'rgba(234,179,8,0.2)',  pulse: stats.pendingOrders > 0 },
            { label:'Order Aktif',    value:stats.activeOrders,   color:'#22c55e',  bg:'rgba(34,197,94,0.08)',    border:'rgba(34,197,94,0.2)' },
            { label:'Total Voucher',  value:stats.totalVouchers,  color:'#60a5fa',  bg:'rgba(96,165,250,0.08)',   border:'rgba(96,165,250,0.2)' },
            { label:'Voucher Aktif',  value:stats.activeVouchers, color:'#22c55e',  bg:'rgba(34,197,94,0.08)',    border:'rgba(34,197,94,0.2)' },
            { label:'Sudah Dipakai',  value:stats.usedVouchers,   color:'rgba(249,243,227,0.4)', bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.08)' },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:'14px', padding:'16px', textAlign:'center', animation: s.pulse ? 'pendingPulse 2s ease infinite' : 'none' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:700, color:s.color, lineHeight:1, marginBottom:'4px' }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize:'11px', color:'rgba(249,243,227,0.4)', lineHeight:1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══ ALERT PENDING ══ */}
        {stats.pendingOrders > 0 && !loading && (
          <div style={{ background:'rgba(234,179,8,0.06)', border:'1px solid rgba(234,179,8,0.25)', borderRadius:'14px', padding:'14px 20px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#eab308', animation:'glow 1.5s ease infinite', flexShrink:0 }} />
            <span style={{ fontSize:'14px', color:'#eab308', fontWeight:600 }}>
              Ada {stats.pendingOrders} order menunggu verifikasi pembayaran!
            </span>
            <button onClick={()=>{ setFilter('pending'); setTab('orders') }} style={{ marginLeft:'auto', background:'rgba(234,179,8,0.15)', border:'1px solid rgba(234,179,8,0.3)', color:'#eab308', borderRadius:'8px', padding:'6px 14px', fontSize:'12px', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", fontWeight:600 }}>
              Lihat Sekarang →
            </button>
          </div>
        )}

        {/* ══ TABS ══ */}
        <div style={{ display:'flex', gap:'0', marginBottom:'24px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.12)', borderRadius:'12px', padding:'4px', width:'fit-content' }}>
          {(['orders','vouchers'] as TabType[]).map(t => (
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:'8px 24px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", fontSize:'14px', fontWeight:600, transition:'all 0.2s',
                background: tab===t ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : 'transparent',
                color:      tab===t ? '#030f08' : 'rgba(249,243,227,0.5)' }}>
              {t === 'orders' ? `📋 Orders (${orders.length})` : `🎴 Semua Voucher`}
            </button>
          ))}
        </div>

        {/* ══ ORDERS TAB ══ */}
        {tab === 'orders' && (
          <>
            {/* Filters */}
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
              <input className="form-input" placeholder="🔍 Cari Order ID atau nama..." value={searchQ} onChange={e=>setSearch(e.target.value)}
                style={{ maxWidth:'280px', padding:'10px 14px', fontSize:'14px' }} />
              <div style={{ display:'flex', gap:'6px' }}>
                {['all','pending','active','rejected'].map(s => (
                  <button key={s} onClick={()=>setFilter(s)}
                    style={{ padding:'8px 16px', borderRadius:'50px', border:`1px solid ${filterStatus===s?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.15)'}`, background:filterStatus===s?'rgba(201,168,76,0.12)':'transparent', color:filterStatus===s?'#e8c96d':'rgba(249,243,227,0.4)', fontSize:'13px', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", fontWeight:filterStatus===s?600:400, transition:'all 0.2s' }}>
                    {s === 'all' ? 'Semua' : statusLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div style={{ textAlign:'center', padding:'60px', color:'rgba(249,243,227,0.3)' }}>⏳ Memuat data...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px', color:'rgba(249,243,227,0.3)' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>📭</div>
                <div>Tidak ada order ditemukan</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {filtered.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isExpanded={expandedOrder === order.order_id}
                    vouchers={orderVouchers[order.order_id] || []}
                    actionLoading={actionLoading}
                    onToggle={() => toggleExpand(order.order_id)}
                    onActivate={() => handleActivate(order.order_id)}
                    onReject={() => handleReject(order.order_id)}
                    onMarkUsed={(kode) => handleMarkUsed(kode, order.order_id)}
                    statusColor={statusColor}
                    statusBg={statusBg}
                    statusLabel={statusLabel}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ VOUCHERS TAB ══ */}
        {tab === 'vouchers' && (
          <VouchersTab statusColor={statusColor} statusBg={statusBg} statusLabel={statusLabel} />
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:'28px', right:'28px', zIndex:999,
          padding:'14px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:600,
          display:'flex', alignItems:'center', gap:'10px', maxWidth:'320px',
          backdropFilter:'blur(12px)', animation:'fadeUp 0.3s ease forwards',
          background:   toast.type==='success'?'rgba(13,61,30,0.95)':toast.type==='error'?'rgba(60,10,10,0.95)':'rgba(20,40,70,0.95)',
          border:       `1px solid ${toast.type==='success'?'rgba(34,197,94,0.3)':toast.type==='error'?'rgba(255,100,100,0.3)':'rgba(100,150,255,0.3)'}`,
          color:        toast.type==='success'?'#22c55e':toast.type==='error'?'rgba(255,130,130,0.9)':'rgba(150,180,255,0.9)',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

// ══ ORDER CARD COMPONENT ══════════════════════════════════════

interface OrderCardProps {
  order: Order
  isExpanded: boolean
  vouchers: Voucher[]
  actionLoading: string|null
  onToggle: () => void
  onActivate: () => void
  onReject: () => void
  onMarkUsed: (kode: string) => void
  statusColor: (s:string) => string
  statusBg: (s:string) => string
  statusLabel: (s:string) => string
}

function OrderCard({ order, isExpanded, vouchers, actionLoading, onToggle, onActivate, onReject, onMarkUsed, statusColor, statusBg, statusLabel }: OrderCardProps) {
  const isPending  = order.status === 'pending'
  const isActive   = order.status === 'active'
  const createdFmt = new Date(order.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })

  return (
    <div style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${isPending?'rgba(234,179,8,0.25)':'rgba(201,168,76,0.1)'}`, borderRadius:'16px', overflow:'hidden', transition:'all 0.3s' }}>

      {/* Header */}
      <div style={{ padding:'18px 24px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        {/* Order info */}
        <div onClick={onToggle} style={{ flex:1, cursor:'pointer', display:'flex', alignItems:'center', gap:'16px', minWidth:'200px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'10px', background: isPending?'rgba(234,179,8,0.1)':statusBg(order.status), border:`1px solid ${statusColor(order.status)}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
            {isPending?'⏳':isActive?'✓':'✗'}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'3px' }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:'15px', color:'#e8c96d', letterSpacing:'1px' }}>{order.order_id}</span>
              <span style={{ fontSize:'11px', padding:'2px 10px', borderRadius:'50px', background:statusBg(order.status), border:`1px solid ${statusColor(order.status)}44`, color:statusColor(order.status), fontWeight:600 }}>{statusLabel(order.status)}</span>
            </div>
            <div style={{ fontSize:'13px', color:'rgba(249,243,227,0.5)' }}>
              {order.nama_pembeli} · {order.no_whatsapp} · {order.jumlah_voucher} voucher
            </div>
          </div>
        </div>

        {/* Date + actions */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <span style={{ fontSize:'12px', color:'rgba(249,243,227,0.3)' }}>{createdFmt}</span>

          {isPending && (
            <>
              <button onClick={onActivate} disabled={actionLoading === order.order_id+'_activate'}
                style={{ background:'linear-gradient(135deg,#1a5c2e,#22c55e)', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 18px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal',sans-serif", transition:'all 0.2s', opacity:actionLoading?0.6:1 }}>
                {actionLoading === order.order_id+'_activate' ? '⏳...' : '✓ Aktifkan'}
              </button>
              <button onClick={onReject} disabled={!!actionLoading}
                style={{ background:'rgba(255,80,80,0.1)', color:'rgba(255,130,130,0.85)', border:'1px solid rgba(255,100,100,0.25)', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Tajawal',sans-serif", transition:'all 0.2s' }}>
                ✗ Tolak
              </button>
            </>
          )}

          {/* WA button */}
          <a href={`https://wa.me/${order.no_whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
            style={{ background:'rgba(37,211,102,0.1)', color:'#25d366', border:'1px solid rgba(37,211,102,0.25)', borderRadius:'8px', padding:'8px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px' }}>
            💬 WA
          </a>

          {/* Expand toggle */}
          <button onClick={onToggle} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(201,168,76,0.15)', color:'rgba(249,243,227,0.5)', borderRadius:'8px', padding:'8px 12px', fontSize:'16px', cursor:'pointer', transition:'all 0.3s', transform:isExpanded?'rotate(180deg)':'none' }}>▾</button>
        </div>
      </div>

      {/* Expanded — Vouchers */}
      {isExpanded && (
        <div style={{ borderTop:'1px solid rgba(201,168,76,0.08)', background:'rgba(0,0,0,0.2)', padding:'20px 24px' }}>
          <div style={{ fontSize:'12px', color:'rgba(249,243,227,0.35)', letterSpacing:'2px', marginBottom:'14px' }}>DAFTAR VOUCHER</div>
          {vouchers.length === 0 ? (
            <div style={{ fontSize:'14px', color:'rgba(249,243,227,0.25)', padding:'20px 0' }}>⏳ Memuat voucher...</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {vouchers.map(v => (
                <div key={v.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'12px 16px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(201,168,76,0.08)', borderRadius:'10px', flexWrap:'wrap' }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'13px', color:'#e8c96d', letterSpacing:'1px', minWidth:'140px' }}>{v.kode_unik}</div>
                  <div style={{ flex:1, fontSize:'13px', color:'rgba(249,243,227,0.65)' }}>
                    <strong style={{ color:'var(--cream)' }}>{v.nama_jemaah || '—'}</strong>
                    {v.kota_domisili && ` · ${v.kota_domisili}`}
                    {v.travel_tujuan && ` · ${v.travel_tujuan}`}
                  </div>
                  <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'50px', background:statusBg(v.status), color:statusColor(v.status), border:`1px solid ${statusColor(v.status)}33`, fontWeight:600 }}>{statusLabel(v.status)}</span>
                  {v.status === 'active' && (
                    <button onClick={() => onMarkUsed(v.kode_unik)} disabled={actionLoading === v.kode_unik+'_used'}
                      style={{ background:'rgba(96,165,250,0.1)', color:'#60a5fa', border:'1px solid rgba(96,165,250,0.25)', borderRadius:'8px', padding:'5px 12px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:"'Tajawal',sans-serif" }}>
                      {actionLoading === v.kode_unik+'_used' ? '⏳...' : '✓ Tandai Terpakai'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══ VOUCHERS TAB COMPONENT ════════════════════════════════════

function VouchersTab({ statusColor, statusBg, statusLabel }: { statusColor:(s:string)=>string; statusBg:(s:string)=>string; statusLabel:(s:string)=>string }) {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    import('@/lib/admin').then(({ getAllVouchers }) => {
      getAllVouchers().then(v => { setVouchers(v); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [])

  const filtered = vouchers.filter(v => {
    const matchStatus = filter === 'all' || v.status === filter
    const matchSearch = !search || v.kode_unik.toLowerCase().includes(search.toLowerCase()) || (v.nama_jemaah||'').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <>
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <input className="form-input" placeholder="🔍 Cari kode atau nama jemaah..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:'280px', padding:'10px 14px', fontSize:'14px' }} />
        <div style={{ display:'flex', gap:'6px' }}>
          {['all','pending','active','used','rejected'].map(s => (
            <button key={s} onClick={()=>setFilter(s)} style={{ padding:'8px 14px', borderRadius:'50px', border:`1px solid ${filter===s?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.15)'}`, background:filter===s?'rgba(201,168,76,0.12)':'transparent', color:filter===s?'#e8c96d':'rgba(249,243,227,0.4)', fontSize:'12px', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", fontWeight:filter===s?600:400 }}>
              {s === 'all' ? 'Semua' : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'rgba(249,243,227,0.3)' }}>⏳ Memuat data...</div>
      ) : (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:'16px', overflow:'hidden' }}>
          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'160px 1fr 1fr 1fr 110px', gap:'0', padding:'12px 20px', background:'rgba(0,0,0,0.3)', borderBottom:'1px solid rgba(201,168,76,0.08)', fontSize:'11px', letterSpacing:'1.5px', color:'rgba(249,243,227,0.3)' }}>
            <div>KODE VOUCHER</div><div>NAMA JEMAAH</div><div>KOTA · TRAVEL</div><div>RENCANA</div><div>STATUS</div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px', color:'rgba(249,243,227,0.25)' }}>Tidak ada voucher ditemukan</div>
          ) : filtered.map((v, i) => (
            <div key={v.id} style={{ display:'grid', gridTemplateColumns:'160px 1fr 1fr 1fr 110px', gap:'0', padding:'13px 20px', borderBottom:'1px solid rgba(201,168,76,0.05)', background:i%2===0?'transparent':'rgba(255,255,255,0.01)', fontSize:'13px', alignItems:'center' }}>
              <div style={{ fontFamily:"'DM Mono',monospace", color:'#e8c96d', fontSize:'12px', letterSpacing:'1px' }}>{v.kode_unik}</div>
              <div style={{ color:'var(--cream)', fontWeight:600 }}>{v.nama_jemaah || <span style={{ color:'rgba(249,243,227,0.25)' }}>—</span>}</div>
              <div style={{ color:'rgba(249,243,227,0.55)', fontSize:'12px' }}>{v.kota_domisili}{v.travel_tujuan?` · ${v.travel_tujuan}`:''}</div>
              <div style={{ color:'rgba(249,243,227,0.4)', fontSize:'12px' }}>{v.rencana_penggunaan ? new Date(v.rencana_penggunaan).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '—'}</div>
              <div><span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'50px', background:statusBg(v.status), color:statusColor(v.status), border:`1px solid ${statusColor(v.status)}33`, fontWeight:600 }}>{statusLabel(v.status)}</span></div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
