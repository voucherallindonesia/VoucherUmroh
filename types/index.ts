export type VoucherStatus = 'pending' | 'active' | 'used' | 'rejected'
export type OrderStatus   = 'pending' | 'active' | 'completed'

export interface Order {
  id: string
  order_id: string
  nama_pembeli: string
  no_whatsapp: string
  jumlah_voucher: number
  status: OrderStatus
  created_at: string
}

export interface Voucher {
  id: string
  kode_unik: string
  order_id: string
  nama_jemaah: string
  kota_domisili: string
  travel_tujuan: string
  rencana_penggunaan: string
  status: VoucherStatus
  created_at: string
}

export interface RegisterFormData {
  order_id: string
  nama_pembeli: string
  no_whatsapp: string
  jumlah_voucher: number
}

export interface JemaahFormData {
  nama_jemaah: string
  kota_domisili: string
  travel_tujuan: string
  rencana_penggunaan: string
}
