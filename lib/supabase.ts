import { createClient } from "@supabase/supabase-js";
import type { Order, Voucher, JemaahFormData } from "@/types";

// ── Lazy client — hanya dibuat saat dibutuhkan di browser ──
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

// ── VOUCHERS ──────────────────────────────────────────────
export async function getVoucherByKode(kode: string): Promise<Voucher | null> {
  const { data, error } = await getClient()
    .from("vouchers")
    .select("*")
    .eq("kode_unik", kode.toUpperCase())
    .single();
  if (error) return null;
  return data as Voucher;
}

// ── ORDERS ────────────────────────────────────────────────
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await getClient()
    .from("orders")
    .select("*")
    .eq("order_id", orderId.toUpperCase())
    .single();
  if (error) return null;
  return data as Order;
}

// ── REGISTRASI ────────────────────────────────────────────
export async function createOrder(payload: {
  order_id: string;
  nama_pembeli: string;
  no_whatsapp: string;
  jumlah_voucher: number;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await getClient()
    .from("orders")
    .insert({
      ...payload,
      order_id: payload.order_id.toUpperCase(),
      status: "pending",
    });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createVouchers(
  orderId: string,
  jemaahList: JemaahFormData[],
): Promise<{ success: boolean; error?: string }> {
  const rows = jemaahList.map((j) => ({
    order_id: orderId.toUpperCase(),
    kode_unik: generateKodeUnik(),
    nama_jemaah: j.nama_jemaah,
    kota_domisili: j.kota_domisili,
    travel_tujuan: j.travel_tujuan,
    rencana_penggunaan: j.rencana_penggunaan,
    status: "pending",
  }));
  const { error } = await getClient().from("vouchers").insert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

function generateKodeUnik(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = (n: number) =>
    Array.from(
      { length: n },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `UV-${rand(4)}-${rand(4)}`;
}
