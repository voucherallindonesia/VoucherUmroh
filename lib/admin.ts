// VoucherUmroh/lib

import { createClient } from "@supabase/supabase-js";
import { generateKodeFromOrderId } from "./supabase";
import type { Order, Voucher } from "@/types";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

// ── AUTH ──────────────────────────────────────────────────────
export function checkAdminPassword(input: string): boolean {
  const pw = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
  return input.trim() === pw.trim();
}
export function setAdminSession() {
  if (typeof window !== "undefined")
    sessionStorage.setItem("admin_auth", "true");
}
export function clearAdminSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem("admin_auth");
}
export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("admin_auth") === "true";
}

// ── FETCH ─────────────────────────────────────────────────────
export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await getClient()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getVouchersByOrderId(
  orderId: string,
): Promise<Voucher[]> {
  const { data, error } = await getClient()
    .from("vouchers")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Voucher[];
}

export async function getAllVouchers(): Promise<Voucher[]> {
  const { data, error } = await getClient()
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Voucher[];
}

// ── ORDER ACTIONS ─────────────────────────────────────────────
export async function activateOrder(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error: e1 } = await getClient()
    .from("orders")
    .update({ status: "active" })
    .eq("order_id", orderId);
  if (e1) return { success: false, error: e1.message };
  const { error: e2 } = await getClient()
    .from("vouchers")
    .update({ status: "active" })
    .eq("order_id", orderId);
  if (e2) return { success: false, error: e2.message };
  return { success: true };
}

export async function rejectOrder(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error: e1 } = await getClient()
    .from("orders")
    .update({ status: "rejected" })
    .eq("order_id", orderId);
  if (e1) return { success: false, error: e1.message };
  const { error: e2 } = await getClient()
    .from("vouchers")
    .update({ status: "rejected" })
    .eq("order_id", orderId);
  if (e2) return { success: false, error: e2.message };
  return { success: true };
}

// ── VOUCHER ACTIONS ───────────────────────────────────────────

export async function markVoucherUsed(
  kodeUnik: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await getClient()
    .from("vouchers")
    .update({ status: "used" })
    .eq("kode_unik", kodeUnik);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Tambah slot voucher baru
 * Kode menggunakan prefix dari Order ID
 */
export async function addVoucher(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const kode = generateKodeFromOrderId(orderId);

  const { error: e1 } = await getClient().from("vouchers").insert({
    order_id: orderId.toUpperCase(),
    kode_unik: kode,
    nama_jemaah: "",
    kota_domisili: "",
    travel_tujuan: "",
    rencana_penggunaan: null,
    status: "active",
  });
  if (e1) return { success: false, error: e1.message };

  const { data: orderData } = await getClient()
    .from("orders")
    .select("jumlah_voucher")
    .eq("order_id", orderId)
    .single();
  if (orderData) {
    await getClient()
      .from("orders")
      .update({ jumlah_voucher: orderData.jumlah_voucher + 1 })
      .eq("order_id", orderId);
  }

  return { success: true };
}

/**
 * Hapus voucher secara permanen
 */
export async function deleteVoucher(
  kodeUnik: string,
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error: e1 } = await getClient()
    .from("vouchers")
    .delete()
    .eq("kode_unik", kodeUnik);
  if (e1) return { success: false, error: e1.message };

  const { data: orderData } = await getClient()
    .from("orders")
    .select("jumlah_voucher")
    .eq("order_id", orderId)
    .single();
  if (orderData && orderData.jumlah_voucher > 0) {
    await getClient()
      .from("orders")
      .update({ jumlah_voucher: orderData.jumlah_voucher - 1 })
      .eq("order_id", orderId);
  }

  return { success: true };
}

/**
 * Reset data jemaah — kosongkan field, voucher tetap aktif
 */
export async function resetVoucherData(
  kodeUnik: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await getClient()
    .from("vouchers")
    .update({
      nama_jemaah: "",
      kota_domisili: "",
      travel_tujuan: "",
      rencana_penggunaan: null,
    })
    .eq("kode_unik", kodeUnik);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── STATS ─────────────────────────────────────────────────────
export async function getDashboardStats() {
  const [orders, vouchers] = await Promise.all([
    getAllOrders(),
    getAllVouchers(),
  ]);
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    activeOrders: orders.filter((o) => o.status === "active").length,
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter((v) => v.status === "active").length,
    usedVouchers: vouchers.filter((v) => v.status === "used").length,
  };
}
