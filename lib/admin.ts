import { supabase } from './supabase'
import type { Order, Voucher } from '@/types'

// ── AUTH ─────────────────────────────────────────────────────
// Password admin disimpan di .env.local
// NEXT_PUBLIC_ADMIN_PASSWORD=passwordrahasiakamu

export function checkAdminPassword(input: string): boolean {
  const pw = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
  return input === pw
}

export function setAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('admin_auth', 'true')
  }
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin_auth')
  }
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('admin_auth') === 'true'
}

// ── DATA FETCHING ─────────────────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function getVouchersByOrderId(orderId: string): Promise<Voucher[]> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Voucher[]
}

export async function getAllVouchers(): Promise<Voucher[]> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Voucher[]
}

// ── ACTIONS ───────────────────────────────────────────────────

/**
 * Aktifkan order + semua voucher terkait sekaligus (1 klik)
 */
export async function activateOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  // Update status order
  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'active' })
    .eq('order_id', orderId)

  if (orderError) return { success: false, error: orderError.message }

  // Update semua voucher terkait
  const { error: voucherError } = await supabase
    .from('vouchers')
    .update({ status: 'active' })
    .eq('order_id', orderId)

  if (voucherError) return { success: false, error: voucherError.message }

  return { success: true }
}

/**
 * Tolak order (rejected)
 */
export async function rejectOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'rejected' })
    .eq('order_id', orderId)

  if (orderError) return { success: false, error: orderError.message }

  const { error: voucherError } = await supabase
    .from('vouchers')
    .update({ status: 'rejected' })
    .eq('order_id', orderId)

  if (voucherError) return { success: false, error: voucherError.message }

  return { success: true }
}

/**
 * Tandai voucher sebagai sudah digunakan
 */
export async function markVoucherUsed(kodeUnik: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('vouchers')
    .update({ status: 'used' })
    .eq('kode_unik', kodeUnik)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ── STATS ─────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [orders, vouchers] = await Promise.all([
    getAllOrders(),
    getAllVouchers(),
  ])

  return {
    totalOrders:    orders.length,
    pendingOrders:  orders.filter(o => o.status === 'pending').length,
    activeOrders:   orders.filter(o => o.status === 'active').length,
    totalVouchers:  vouchers.length,
    activeVouchers: vouchers.filter(v => v.status === 'active').length,
    usedVouchers:   vouchers.filter(v => v.status === 'used').length,
  }
}
