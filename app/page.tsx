'use client'

import { useState } from 'react'
import Link from 'next/link'

const WA_URL  = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '6285167060863'}`
const BUY_URL = process.env.NEXT_PUBLIC_PAYMENT_URL || 'https://link.id'

const BENEFITS = [
  { icon:'🕌', title:'Berlaku di Semua Travel',   desc:'Tidak terikat satu travel tertentu. Berlaku di seluruh travel umroh resmi di Indonesia — kamu bebas memilih.' },
  { icon:'📅', title:'Waktu Redeem Fleksibel',    desc:'Gunakan voucher sesuai jadwal keberangkatanmu. Tidak ada tekanan tenggat waktu.' },
  { icon:'♾️', title:'Tidak Ada Batas Waktu',     desc:'Beli sekarang, simpan kapanpun. Voucher ini tidak akan pernah kedaluwarsa.' },
]

const STEPS = [
  { n:'1', icon:'🛒', title:'Beli Voucher',       desc:'Lakukan pembayaran Rp 99.000 melalui link.id dengan aman.' },
  { n:'2', icon:'📨', title:'Dapat Order ID',      desc:'Terima Order ID dan link registrasi setelah pembayaran sukses.' },
  { n:'3', icon:'📝', title:'Isi Data Jemaah',     desc:'Daftarkan data jemaah melalui form registrasi di website kami.' },
  { n:'4', icon:'✅', title:'Konfirmasi Admin',     desc:'Tim kami memverifikasi pembayaran dan mengaktifkan voucher.' },
  { n:'5', icon:'🎴', title:'Voucher Aktif!',       desc:'Kartu digital vouchermu siap — download kapanpun via tracking.' },
]

const TESTIMONIALS = [
  { init:'BH', name:'Budi Hartono',  city:'Surabaya, Jawa Timur',      text:'Awalnya ragu, tapi vouchernya beneran berlaku di travel yang saya pilih. Hemat Rp 500 ribu lumayan banget buat biaya living cost di sana.' },
  { init:'SR', name:'Siti Rahayu',   city:'Makassar, Sulawesi Selatan', text:'Saya beli 3 voucher sekaligus untuk saya, suami, dan ibu mertua. Prosesnya gampang dan kartunya cantik! Tidak ada expired-nya.' },
  { init:'AN', name:'Ahmad Nasir',   city:'Bandung, Jawa Barat',        text:'Tunjukkan vouchernya ke travel dan langsung dipotong Rp 500 ribu. Tidak ribet sama sekali. Recommended banget!' },
]

const FAQS = [
  { q:'Voucher ini berlaku di travel mana saja?',               a:'Berlaku di seluruh travel umroh resmi yang terdaftar di Indonesia. Bebas pilih travel yang paling cocok.' },
  { q:'Apakah voucher ini bisa kedaluwarsa?',                   a:'Tidak. Tidak ada batas waktu. Kamu bisa membeli sekarang dan menyimpannya hingga siap berangkat.' },
  { q:'Bisakah satu pembelian untuk beberapa jemaah?',          a:'Bisa! Dalam satu Order ID, kamu bisa mendaftarkan beberapa jemaah sekaligus termasuk keluarga.' },
  { q:'Bagaimana cara menggunakan voucher di travel?',          a:'Tunjukkan kartu digital vouchermu saat pendaftaran. Travel akan langsung memotong Rp 500.000.' },
  { q:'Berapa lama proses aktivasi setelah pembayaran?',        a:'Setelah isi form registrasi, tim kami verifikasi dalam 1×24 jam di hari kerja dan menghubungimu via WhatsApp.' },
  { q:'Apakah data jemaah bisa diubah setelah diisi?',          a:'Perubahan data hanya oleh admin. Hubungi tim kami melalui WhatsApp dan kami bantu dengan senang hati.' },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number|null>(0)

  const G = (s: TemplateStringsArray, ...v: unknown[]) =>
    s.reduce((a, b, i) => a + (v[i-1] ?? '') + b)

  return (
    <>
      <div className="pattern-bg" />

      {/* ══ HERO ══ */}
      <section id="hero" style={{ minHeight:'100vh', padding:'120px 6% 80px', display:'flex', alignItems:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-200px', left:'-200px', width:'700px', height:'700px', background:'radial-gradient(circle,rgba(26,107,56,0.18) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-100px', right:'-100px', width:'500px', height:'500px', background:'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center', maxWidth:'1280px', margin:'0 auto', width:'100%', position:'relative', zIndex:1 }} className="hero-grid">
          <div>
            <div className="fade-up d1" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:'50px', padding:'6px 16px', fontSize:'12px', color:'#e8c96d', letterSpacing:'1px', marginBottom:'24px' }}>
              <div style={{ width:'6px', height:'6px', background:'#c9a84c', borderRadius:'50%', animation:'glow 2s ease infinite' }} />
              Voucher Resmi Umroh Indonesia
            </div>
            <h1 className="fade-up d2 serif" style={{ fontSize:'clamp(36px,5vw,62px)', fontWeight:700, lineHeight:1.1, marginBottom:'20px' }}>
              Hemat <span className="shimmer">Rp 500.000</span><br />untuk Perjalanan<br />Ibadahmu
            </h1>
            <p className="fade-up d3" style={{ fontSize:'17px', color:'var(--cream-dim)', lineHeight:1.75, marginBottom:'36px', maxWidth:'480px' }}>
              Voucher diskon umroh yang berlaku di seluruh travel, tanpa batas waktu, dan fleksibel sesuai jadwal keberangkatanmu.
            </p>
            <div className="fade-up d4" style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'40px' }}>
              <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="btn-gold">🛒 Beli Voucher — Rp 99.000</a>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">💬 Konsultasi via WhatsApp</a>
            </div>
            <div className="fade-up d5" style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
              {['Berlaku semua travel','Tidak ada expired','Jadwal fleksibel'].map(t => (
                <div key={t} style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', color:'rgba(249,243,227,0.5)' }}>
                  <div style={{ width:'16px', height:'16px', background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.4)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#22c55e', flexShrink:0 }}>✓</div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Voucher Card */}
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
            <div style={{ position:'absolute', width:'440px', height:'440px', borderRadius:'50%', border:'1px solid rgba(201,168,76,0.08)', animation:'rotateSlow 20s linear infinite' }} />
            <div style={{ position:'absolute', width:'380px', height:'380px', borderRadius:'50%', border:'1px solid rgba(201,168,76,0.05)', animation:'rotateSlow 28s linear reverse infinite' }} />
            <div style={{ width:'340px', background:'linear-gradient(145deg,#0d4a24,#1a7a3e,#0b3b1c)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:'24px', padding:'32px', position:'relative', overflow:'hidden', animation:'float 5s ease-in-out infinite, pulseRing 4s ease-in-out infinite', boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent)' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'28px' }}>
                <div style={{ width:'32px', height:'32px', background:'linear-gradient(135deg,#c9a84c,#e8c96d)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px' }}>🕋</div>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'13px', fontWeight:600, color:'#e8c96d' }}>Voucher Umroh</span>
                <div style={{ width:'40px', height:'28px', background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'5px', marginLeft:'auto' }} />
              </div>
              <div style={{ fontSize:'11px', letterSpacing:'2px', color:'rgba(249,243,227,0.4)', marginBottom:'6px' }}>NILAI DISKON</div>
              <div className="shimmer serif" style={{ fontSize:'38px', fontWeight:700, lineHeight:1, marginBottom:'4px' }}>Rp 500.000</div>
              <div style={{ fontSize:'11px', color:'rgba(249,243,227,0.4)', marginBottom:'28px' }}>untuk biaya perjalanan umroh</div>
              <hr style={{ border:'none', borderTop:'1px dashed rgba(201,168,76,0.25)', marginBottom:'24px' }} />
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(249,243,227,0.35)', marginBottom:'6px' }}>KODE VOUCHER</div>
              <div className="mono" style={{ fontSize:'18px', letterSpacing:'6px', color:'#e8c96d', fontWeight:500, marginBottom:'20px' }}>UV•XXXX•XXXX</div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {['✓ Semua Travel','✓ No Expired','✓ Fleksibel'].map(t => (
                  <span key={t} style={{ fontSize:'10px', padding:'4px 10px', borderRadius:'50px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', color:'rgba(249,243,227,0.55)' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div style={{ padding:'28px 6%', background:'rgba(13,61,30,0.4)', borderTop:'1px solid rgba(201,168,76,0.08)', borderBottom:'1px solid rgba(201,168,76,0.08)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', display:'flex', justifyContent:'center', gap:'60px', flexWrap:'wrap' }}>
          {[['500+','Jamaah Terbantu'],['200+','Travel Partner'],['34','Provinsi di Indonesia'],['100%','Kepuasan Jamaah']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div className="shimmer serif" style={{ fontSize:'32px', fontWeight:700, lineHeight:1, marginBottom:'4px' }}>{n}</div>
              <div style={{ fontSize:'13px', color:'rgba(249,243,227,0.45)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PROBLEM & SOLUTION ══ */}
      <section id="problem" style={{ padding:'100px 6%', background:'rgba(5,18,10,0.6)', position:'relative' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div className="label-tag">Mengapa Voucher Umroh?</div>
            <h2 className="serif" style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:700 }}>Kami Hadir untuk Meringankan<br /><span className="shimmer">Beban Biaya Ibadahmu</span></h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px' }} className="problem-grid">
            {[
              { title:'😔 Tantangan Umum', color:'rgba(255,130,130,0.85)', bg:'rgba(255,60,60,0.04)', border:'rgba(255,100,100,0.1)',
                items:[['💸','Biaya umroh yang terus meningkat membuat banyak keluarga menunda niat ibadah.'],['📅','Diskon dari travel seringkali terbatas pada waktu tertentu dan tidak sesuai jadwal.'],['🗺️','Promo hanya berlaku di satu travel, pilihan jamaah menjadi sangat terbatas.'],['⏳','Voucher promo biasanya memiliki batas waktu pendek yang membuat stres.']] },
              { title:'✨ Solusi Kami', color:'rgba(34,197,94,0.9)', bg:'rgba(34,197,94,0.04)', border:'rgba(34,197,94,0.15)',
                items:[['💰','Potongan langsung Rp 500.000 hanya dengan membeli voucher Rp 99.000 — investasi kecil, manfaat besar.'],['🕌','Berlaku di seluruh travel umroh terdaftar di Indonesia — bebas pilih sesuai keinginan.'],['♾️','Tidak ada batas waktu. Beli sekarang, gunakan kapanpun kamu siap berangkat.'],['👨‍👩‍👧‍👦','Bisa dibeli untuk seluruh anggota keluarga dalam satu pembelian.']] },
            ].map(side => (
              <div key={side.title} style={{ padding:'36px', borderRadius:'20px', background:side.bg, border:`1px solid ${side.border}` }}>
                <div className="serif" style={{ fontSize:'22px', fontWeight:600, color:side.color, marginBottom:'24px' }}>{side.title}</div>
                {side.items.map(([icon, text]) => (
                  <div key={text} style={{ display:'flex', gap:'12px', marginBottom:'16px', fontSize:'15px', color:'var(--cream-dim)', lineHeight:1.6 }}>
                    <span style={{ flexShrink:0 }}>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ KEUNGGULAN ══ */}
      <section id="keunggulan" style={{ padding:'100px 6%' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div className="label-tag">Keunggulan Kami</div>
            <h2 className="serif" style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:700 }}>Tiga Alasan Mengapa<br /><span className="shimmer">Kami Berbeda</span></h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px' }} className="benefits-grid">
            {BENEFITS.map(b => (
              <div key={b.title} style={{ padding:'36px 28px', borderRadius:'20px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(201,168,76,0.12)', transition:'all 0.35s ease', cursor:'default' }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.transform='translateY(-6px)'; el.style.borderColor='rgba(201,168,76,0.3)' }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.transform=''; el.style.borderColor='rgba(201,168,76,0.12)' }}>
                <div style={{ width:'56px', height:'56px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', marginBottom:'20px' }}>{b.icon}</div>
                <div className="serif" style={{ fontSize:'19px', fontWeight:600, color:'#e8c96d', marginBottom:'10px' }}>{b.title}</div>
                <p style={{ fontSize:'14px', color:'rgba(249,243,227,0.5)', lineHeight:1.75 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CARA KERJA ══ */}
      <section id="cara-kerja" style={{ padding:'100px 6%', background:'rgba(7,26,15,0.5)', position:'relative' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div className="label-tag">Prosesnya Mudah</div>
            <h2 className="serif" style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:700 }}>Cara Mendapatkan<br /><span className="shimmer">Voucher Umrohmu</span></h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'16px' }} className="steps-grid">
            {STEPS.map((s,i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(13,61,30,0.9)', border:'1.5px solid rgba(201,168,76,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display',serif", fontSize:'20px', fontWeight:700, color:'#c9a84c', marginBottom:'16px', transition:'all 0.3s', flexShrink:0 }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.background='#c9a84c'; el.style.color='#030f08' }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.background='rgba(13,61,30,0.9)'; el.style.color='#c9a84c' }}>
                  {s.n}
                </div>
                <div style={{ fontSize:'20px', marginBottom:'12px' }}>{s.icon}</div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'var(--cream)', marginBottom:'6px', lineHeight:1.3 }}>{s.title}</div>
                <p style={{ fontSize:'12px', color:'rgba(249,243,227,0.45)', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HARGA ══ */}
      <section id="harga" style={{ padding:'100px 6%', textAlign:'center' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="label-tag">Penawaran Terbaik</div>
          <h2 className="serif" style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:700, marginBottom:'48px' }}>Satu Harga,<br /><span className="shimmer">Manfaat Berlipat</span></h2>
          <div style={{ maxWidth:'460px', margin:'0 auto', background:'linear-gradient(145deg,rgba(13,61,30,0.8),rgba(7,26,15,0.9))', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'28px', padding:'48px 40px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#c9a84c,#e8c96d,#c9a84c)' }} />
            <div style={{ display:'inline-block', background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', color:'#22c55e', fontSize:'12px', padding:'4px 14px', borderRadius:'50px', letterSpacing:'1px', marginBottom:'28px' }}>✦ PENAWARAN TERBATAS</div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center', gap:'6px', marginBottom:'6px' }}>
              <span style={{ fontSize:'22px', fontWeight:700, color:'#c9a84c', marginTop:'8px' }}>Rp</span>
              <span className="shimmer serif" style={{ fontSize:'68px', fontWeight:700, lineHeight:1 }}>99</span>
              <span style={{ fontSize:'20px', fontWeight:700, color:'#c9a84c', marginTop:'8px' }}>.000</span>
            </div>
            <p style={{ fontSize:'13px', color:'rgba(249,243,227,0.35)', marginBottom:'32px' }}>harga per voucher · satu kali bayar</p>
            <div style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'14px', padding:'18px 24px', marginBottom:'28px' }}>
              <div style={{ fontSize:'12px', color:'rgba(249,243,227,0.4)', letterSpacing:'1px', marginBottom:'6px' }}>NILAI DISKON YANG KAMU DAPATKAN</div>
              <div className="shimmer serif" style={{ fontSize:'28px', fontWeight:700 }}>Rp 500.000</div>
            </div>
            <div style={{ textAlign:'left', marginBottom:'32px' }}>
              {['Berlaku di seluruh travel umroh Indonesia','Tidak ada batas waktu penggunaan (no expired)','Kartu voucher digital eksklusif','Bisa untuk beberapa jemaah dalam satu pembelian','Support via WhatsApp langsung dari tim kami'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'14px', color:'rgba(249,243,227,0.65)', marginBottom:'12px' }}>
                  <div style={{ width:'18px', height:'18px', background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#22c55e', flexShrink:0 }}>✓</div>{f}
                </div>
              ))}
            </div>
            <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ width:'100%', fontSize:'16px', padding:'16px' }}>🛒 Beli Voucher Sekarang</a>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONI ══ */}
      <section id="testimoni" style={{ padding:'100px 6%', background:'rgba(3,12,6,0.7)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div className="label-tag">Mereka Sudah Merasakan</div>
            <h2 className="serif" style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:700 }}>Cerita dari<br /><span className="shimmer">Jamaah Kami</span></h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }} className="testi-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding:'28px', borderRadius:'18px', background:'rgba(7,26,15,0.6)', border:'1px solid rgba(201,168,76,0.1)', transition:'all 0.3s' }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.transform='translateY(-4px)'; el.style.borderColor='rgba(201,168,76,0.2)' }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.transform=''; el.style.borderColor='rgba(201,168,76,0.1)' }}>
                <div style={{ color:'#c9a84c', fontSize:'14px', letterSpacing:'2px', marginBottom:'14px' }}>★★★★★</div>
                <p style={{ fontSize:'15px', color:'rgba(249,243,227,0.65)', lineHeight:1.8, fontStyle:'italic', marginBottom:'20px' }}>&ldquo;{t.text}&rdquo;</p>
                <div className="divider" style={{ marginBottom:'16px' }} />
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#1a6b38,#0d3d1e)', border:'1.5px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'15px', color:'#e8c96d', flexShrink:0 }}>{t.init}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'14px', color:'var(--cream)' }}>{t.name}</div>
                    <div style={{ fontSize:'12px', color:'#c9a84c', marginTop:'2px' }}>📍 {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" style={{ padding:'100px 6%', background:'rgba(5,18,10,0.5)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div className="label-tag">FAQ</div>
            <h2 className="serif" style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:700 }}>Pertanyaan yang<br /><span className="shimmer">Sering Ditanyakan</span></h2>
          </div>
          <div style={{ maxWidth:'760px', margin:'0 auto' }}>
            {FAQS.map((f,i) => (
              <div key={i} style={{ borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ width:'100%', background:'none', border:'none', color:'var(--cream)', fontFamily:"'Tajawal',sans-serif", fontSize:'16px', fontWeight:600, padding:'20px 0', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'16px' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#e8c96d'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--cream)'}>
                  {f.q}
                  <span style={{ width:'28px', height:'28px', borderRadius:'50%', border:'1px solid rgba(201,168,76,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', color:'#c9a84c', flexShrink:0, transition:'all 0.3s', transform:openFaq===i?'rotate(45deg)':'none', background:openFaq===i?'rgba(201,168,76,0.1)':'transparent' }}>+</span>
                </button>
                <div style={{ maxHeight:openFaq===i?'300px':'0', overflow:'hidden', transition:'max-height 0.4s ease' }}>
                  <div style={{ padding:'0 0 20px', fontSize:'15px', color:'rgba(249,243,227,0.55)', lineHeight:1.8 }}>{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding:'100px 6%', textAlign:'center', background:'radial-gradient(ellipse at center,rgba(26,107,56,0.15) 0%,transparent 60%)' }}>
        <span style={{ fontSize:'60px', marginBottom:'20px', display:'block' }}>🕋</span>
        <h2 className="serif" style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:700, lineHeight:1.15, marginBottom:'20px' }}>
          Mulai Perjalanan Ibadah<br /><span className="shimmer">Lebih Hemat Hari Ini</span>
        </h2>
        <p style={{ fontSize:'17px', color:'var(--cream-dim)', maxWidth:'520px', margin:'0 auto 48px', lineHeight:1.75 }}>
          Bergabunglah bersama ratusan jamaah yang telah merasakan manfaatnya. Hemat Rp 500.000 menunggumu.
        </p>
        <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ fontSize:'17px', padding:'17px 42px' }}>🛒 Beli Voucher — Rp 99.000</a>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ fontSize:'17px', padding:'16px 42px' }}>💬 Tanya via WhatsApp</a>
        </div>
      </section>
    </>
  )
}
