import { createClient } from '@supabase/supabase-js'
import type { Order, Voucher, JemaahFormData } from '@/types'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── VOUCHERS ────────────────────────────────────────────────

/**
 * Cek apakah kode voucher valid & ambil datanya
 */
export async function getVoucherByKode(kode: string): Promise<Voucher | null> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('kode_unik', kode.toUpperCase())
    .single()

  if (error) return null
  return data as Voucher
}

// ─── ORDERS ──────────────────────────────────────────────────

/**
 * Cek apakah Order ID valid (sudah dikonfirmasi admin)
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId.toUpperCase())
    .single()

  if (error) return null
  return data as Order
}

// ─── REGISTRASI ───────────────────────────────────────────────

/**
 * Simpan data order baru (saat customer submit registrasi)
 */
export async function createOrder(payload: {
  order_id: string
  nama_pembeli: string
  no_whatsapp: string
  jumlah_voucher: number
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('orders').insert({
    ...payload,
    order_id: payload.order_id.toUpperCase(),
    status: 'pending',
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Simpan data jemaah per voucher
 */
export async function createVouchers(
  orderId: string,
  jemaahList: JemaahFormData[]
): Promise<{ success: boolean; error?: string }> {
  const rows = jemaahList.map((j) => ({
    order_id: orderId.toUpperCase(),
    kode_unik: generateKodeUnik(),
    nama_jemaah: j.nama_jemaah,
    kota_domisili: j.kota_domisili,
    travel_tujuan: j.travel_tujuan,
    rencana_penggunaan: j.rencana_penggunaan,
    status: 'pending',
  }))

  const { error } = await supabase.from('vouchers').insert(rows)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── HELPER ───────────────────────────────────────────────────

function generateKodeUnik(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand  = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `UV-${rand(4)}-${rand(4)}`
}
