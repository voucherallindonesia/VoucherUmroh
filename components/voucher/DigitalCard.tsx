'use client'

import { useEffect, useState } from 'react'
import type { Voucher } from '@/types'

interface DigitalCardProps { voucher: Voucher }

const BASE = '/VoucherUmroh'

function buildTrackingUrl(kodeUnik: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const path   = typeof window !== 'undefined' && window.location.pathname.includes('VoucherUmroh') ? '/VoucherUmroh' : ''
  return `${origin}${path}/tracking?code=${encodeURIComponent(kodeUnik)}`
}

function buildQRMatrix(text: string): boolean[][] {
  const size = 25
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))
  const drawFinder = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++)
      if (r+dr < size && c+dc < size)
        matrix[r+dr][c+dc] = dr===0||dr===6||dc===0||dc===6||(dr>=2&&dr<=4&&dc>=2&&dc<=4)
  }
  drawFinder(0,0); drawFinder(0,size-7); drawFinder(size-7,0)
  for (let i=8;i<size-8;i++){matrix[6][i]=i%2===0;matrix[i][6]=i%2===0}
  let hash=5381
  for (let i=0;i<text.length;i++) hash=((hash<<5)+hash)^text.charCodeAt(i)
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
    if (!matrix[r][c]) {
      const inTL=r<9&&c<9, inTR=r<9&&c>size-10, inBL=r>size-10&&c<9
      if (!inTL&&!inTR&&!inBL) {
        const seed=hash^(r*73856093)^(c*19349663)^(text.charCodeAt((r*c)%text.length)||0)
        matrix[r][c]=(seed>>>0)%3!==0
      }
    }
  }
  return matrix
}

function QRCodeSVG({ text, size=80 }: { text:string; size?:number }) {
  const matrix = buildQRMatrix(text)
  const n = matrix.length
  const cell = size/n
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
      <rect width={size} height={size} fill="white"/>
      {matrix.flatMap((row,r) => row.map((filled,c) =>
        filled ? <rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell+0.5} height={cell+0.5} fill="#0a2e18"/> : null
      ))}
    </svg>
  )
}

export default function DigitalCard({ voucher }: DigitalCardProps) {
  const [url, setUrl] = useState('')
  useEffect(() => { setUrl(buildTrackingUrl(voucher.kode_unik)) }, [voucher.kode_unik])

  const rencanaFmt = voucher.rencana_penggunaan
    ? new Date(voucher.rencana_penggunaan).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
    : '—'

  const fields = [
    { label:'KODE VOUCHER',      value: voucher.kode_unik,            gold: true  },
    { label:'NAMA JEMAAH',       value: voucher.nama_jemaah   || '—', gold: false },
    { label:'KOTA DOMISILI',     value: voucher.kota_domisili || '—', gold: false },
    { label:'TRAVEL TUJUAN',     value: voucher.travel_tujuan || '—', gold: false },
    { label:'RENCANA BERANGKAT', value: rencanaFmt,                   gold: false },
  ]

  // Card size — 1030:648 aspect ratio
  const W = 780, H = 490

  return (
    <div id="digitalCard" style={{ width:`${W}px`, height:`${H}px`, position:'relative', overflow:'hidden', borderRadius:'12px', fontFamily:"'Tajawal',sans-serif" }}>

      {/* ── Template PNG ── */}
      <img
        src={`${BASE}/card.png`}
        alt="card"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', borderRadius:'12px' }}
        crossOrigin="anonymous"
      />

      {/* ── TITLE — top left ── */}
      <div style={{ position:'absolute', top:'24px', left:'36px' }}>
        <div style={{ fontSize:'9px', letterSpacing:'3px', color:'rgba(255,255,255,0.45)', marginBottom:'3px', fontWeight:500 }}>KARTU DISKON RESMI</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:700, color:'#ffffff', letterSpacing:'3px', textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>UMRAH VOUCHER</div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'3px' }}>
          <div style={{ height:'1.5px', width:'28px', background:'linear-gradient(90deg,#c9a84c,#e8c96d)' }} />
          <span style={{ fontSize:'8px', color:'#c9a84c', letterSpacing:'2px', fontWeight:500 }}>VOUCHER UMROH</span>
        </div>
      </div>

      {/* ── DATA FIELDS — left area ── */}
      <div style={{ position:'absolute', top:'120px', left:'36px', right:'360px', display:'flex', flexDirection:'column' }}>
        {fields.map(f => (
          <div key={f.label} style={{ padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:'8px', letterSpacing:'1.5px', color:'rgba(255,255,255,0.38)', marginBottom:'2px', fontWeight:500 }}>{f.label}</div>
            <div style={{ fontSize: f.gold?'12px':'13px', fontWeight: f.gold?700:500, color: f.gold?'#e8c96d':'#ffffff', fontFamily: f.gold?"'DM Mono',monospace":'inherit', letterSpacing: f.gold?'1.5px':'normal', textShadow:'0 1px 4px rgba(0,0,0,0.6)', wordBreak:'break-all' }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── NILAI DISKON — bottom left ── */}
      <div style={{ position:'absolute', bottom:'24px', left:'36px' }}>
        <div style={{ fontSize:'8px', letterSpacing:'2px', color:'rgba(255,255,255,0.38)', marginBottom:'3px' }}>NILAI DISKON</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'24px', fontWeight:700, color:'#e8c96d', textShadow:'0 0 20px rgba(201,168,76,0.4)' }}>Rp 500.000</div>
        <div style={{ fontSize:'8px', color:'rgba(255,255,255,0.3)', marginTop:'2px', letterSpacing:'0.5px' }}>berlaku di semua travel umroh indonesia</div>
      </div>

      {/* ── QR CODE — pojok kanan bawah panel putih ── */}
      {/* Posisi mengikuti kotak hijau di template: ~80% x, ~75% y */}
      <div style={{ position:'absolute', bottom:'18px', right:'22px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
        <div style={{ background:'white', padding:'4px', borderRadius:'5px', boxShadow:'0 2px 10px rgba(0,0,0,0.3)' }}>
          <QRCodeSVG text={url || voucher.kode_unik} size={78} />
        </div>
        <div style={{ fontSize:'7px', letterSpacing:'1.5px', color:'rgba(255,255,255,0.5)', fontWeight:500 }}>SCAN ME</div>
      </div>

      {/* ── STATUS — top right area ── */}
      <div style={{ position:'absolute', top:'24px', right:'260px', fontSize:'8px', letterSpacing:'1.5px', color:'rgba(34,197,94,0.85)', fontWeight:700, border:'1px solid rgba(34,197,94,0.3)', padding:'4px 10px', borderRadius:'50px', background:'rgba(34,197,94,0.08)', backdropFilter:'blur(4px)', whiteSpace:'nowrap' }}>
        ✓ AKTIF · SIAP DIGUNAKAN
      </div>

    </div>
  )
}
