import type { Voucher } from '@/types'

const BASE = '/VoucherUmroh'

function buildTrackingUrl(kodeUnik: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const path   = typeof window !== 'undefined' && window.location.pathname.includes('VoucherUmroh') ? '/VoucherUmroh' : ''
  return `${origin}${path}/tracking?code=${encodeURIComponent(kodeUnik)}`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img  = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src     = src
  })
}

function buildQRMatrix(text: string): boolean[][] {
  const size = 25
  const m: boolean[][] = Array.from({length:size},()=>Array(size).fill(false))
  const drawFinder = (r:number,c:number) => {
    for (let dr=0;dr<7;dr++) for (let dc=0;dc<7;dc++)
      if (r+dr<size&&c+dc<size)
        m[r+dr][c+dc]=dr===0||dr===6||dc===0||dc===6||(dr>=2&&dr<=4&&dc>=2&&dc<=4)
  }
  drawFinder(0,0); drawFinder(0,size-7); drawFinder(size-7,0)
  for (let i=8;i<size-8;i++){m[6][i]=i%2===0;m[i][6]=i%2===0}
  let hash=5381
  for (let i=0;i<text.length;i++) hash=((hash<<5)+hash)^text.charCodeAt(i)
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
    if (!m[r][c]) {
      const inTL=r<9&&c<9,inTR=r<9&&c>size-10,inBL=r>size-10&&c<9
      if (!inTL&&!inTR&&!inBL) {
        const seed=hash^(r*73856093)^(c*19349663)^(text.charCodeAt((r*c)%text.length)||0)
        m[r][c]=(seed>>>0)%3!==0
      }
    }
  }
  return m
}

function drawQR(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  const matrix = buildQRMatrix(text)
  const n      = matrix.length
  const cell   = size / n
  // White bg
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(x-4, y-4, size+8, size+8, 5)
  ctx.fill()
  // Modules
  ctx.fillStyle = '#0a2e18'
  for (let r=0;r<n;r++) for (let c=0;c<n;c++)
    if (matrix[r][c]) ctx.fillRect(x+c*cell, y+r*cell, cell+0.5, cell+0.5)
}

export async function downloadVoucherCard(voucher: Voucher): Promise<void> {
  // Work at 2x resolution (1560 x 980)
  const W = 1560, H = 980
  const canvas  = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently:true })
  if (!ctx) throw new Error('Canvas not available')

  // Scale 2x for high DPI
  ctx.scale(2, 2)
  const w = W/2, h = H/2  // logical: 780 x 490

  // 1. Template PNG background
  try {
    const tpl = await loadImage(`${BASE}/card.png`)
    ctx.drawImage(tpl, 0, 0, w, h)
  } catch {
    ctx.fillStyle = '#0d3d1e'
    ctx.fillRect(0, 0, w, h)
  }

  // 2. Text — helper
  const txt = (text:string, x:number, y:number, font:string, color:string, letterSpacing=0) => {
    ctx.font         = font
    ctx.fillStyle    = color
    ctx.letterSpacing = letterSpacing ? `${letterSpacing}px` : 'normal'
    ctx.fillText(text, x, y)
  }

  ctx.textBaseline = 'top'

  // ── TITLE ─────────────────────────────────────────────────
  txt('KARTU DISKON RESMI', 36, 24, '500 9px Tajawal,sans-serif', 'rgba(255,255,255,0.45)', 3)
  txt('UMRAH VOUCHER',       36, 40, 'bold 26px "Playfair Display",serif', '#ffffff', 3)

  // Gold line
  const gLine = ctx.createLinearGradient(36,0,70,0)
  gLine.addColorStop(0,'#c9a84c'); gLine.addColorStop(1,'#e8c96d')
  ctx.fillStyle = gLine
  ctx.fillRect(36, 74, 28, 1.5)
  txt('VOUCHER UMROH', 70, 70, '500 8px Tajawal,sans-serif', '#c9a84c', 2)

  // ── STATUS ────────────────────────────────────────────────
  ctx.fillStyle   = 'rgba(34,197,94,0.08)'
  ctx.strokeStyle = 'rgba(34,197,94,0.3)'
  ctx.lineWidth   = 1
  ctx.beginPath(); ctx.roundRect(w-390, 20, 178, 20, 10); ctx.fill(); ctx.stroke()
  txt('✓ AKTIF · SIAP DIGUNAKAN', w-385, 24, 'bold 8px Tajawal,sans-serif', 'rgba(34,197,94,0.85)', 1.5)

  // ── FIELDS ───────────────────────────────────────────────
  const rencanaFmt = voucher.rencana_penggunaan
    ? new Date(voucher.rencana_penggunaan).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
    : '—'

  const fields = [
    { label:'KODE VOUCHER',      value: voucher.kode_unik,            gold:true  },
    { label:'NAMA JEMAAH',       value: voucher.nama_jemaah   || '—', gold:false },
    { label:'KOTA DOMISILI',     value: voucher.kota_domisili || '—', gold:false },
    { label:'TRAVEL TUJUAN',     value: voucher.travel_tujuan || '—', gold:false },
    { label:'RENCANA BERANGKAT', value: rencanaFmt,                   gold:false },
  ]

  let fy = 120
  fields.forEach(f => {
    txt(f.label, 36, fy, '500 8px Tajawal,sans-serif', 'rgba(255,255,255,0.38)', 1.5)
    txt(f.value, 36, fy+13,
      f.gold ? 'bold 12px "DM Mono",monospace' : '500 13px Tajawal,sans-serif',
      f.gold ? '#e8c96d' : '#ffffff',
      f.gold ? 1.5 : 0
    )
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fillRect(36, fy+30, w-380, 1)
    fy += 37
  })

  // ── NILAI DISKON ──────────────────────────────────────────
  txt('NILAI DISKON', 36, h-65, '500 8px Tajawal,sans-serif', 'rgba(255,255,255,0.38)', 2)
  const gGold = ctx.createLinearGradient(36,0,220,0)
  gGold.addColorStop(0,'#c9a84c'); gGold.addColorStop(0.5,'#f5e09a'); gGold.addColorStop(1,'#e8c96d')
  ctx.fillStyle = gGold
  ctx.font      = 'bold 24px "Playfair Display",serif'
  ctx.letterSpacing = 'normal'
  ctx.fillText('Rp 500.000', 36, h-50)
  txt('berlaku di semua travel umroh indonesia', 36, h-22, '400 8px Tajawal,sans-serif', 'rgba(255,255,255,0.3)', 0.5)

  // ── QR CODE — pojok kanan bawah ───────────────────────────
  const qrUrl  = buildTrackingUrl(voucher.kode_unik)
  const qrSize = 78
  const qrX    = w - qrSize - 22   // right: 22px dari tepi
  const qrY    = h - qrSize - 28   // bottom: 28px dari tepi
  drawQR(ctx, qrUrl, qrX, qrY, qrSize)

  ctx.fillStyle  = 'rgba(255,255,255,0.5)'
  ctx.font       = '500 7px Tajawal,sans-serif'
  ctx.letterSpacing = '1.5px'
  ctx.textAlign  = 'center'
  ctx.fillText('SCAN ME', qrX + qrSize/2, qrY + qrSize + 6)
  ctx.textAlign = 'left'

  // 3. Export PNG
  const dataUrl = canvas.toDataURL('image/png', 1.0)
  const link    = document.createElement('a')
  link.download = `VoucherUmroh-${voucher.kode_unik}.png`
  link.href     = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
