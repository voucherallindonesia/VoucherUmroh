// VoucherUmroh/app/register

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import {
  getOrderById,
  getVouchersByOrderId,
  createOrder,
  createVouchers,
  updateVoucherData,
} from "@/lib/supabase";
import type { Order, Voucher, JemaahFormData } from "@/types";

type PageMode =
  | "input" // Step awal: input order ID
  | "new" // Order belum ada: form baru
  | "resume" // Order sudah ada: tampil data existing
  | "done"; // Selesai submit

type ToastState = { message: string; type: "success" | "error" | "info" };

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || "6285167060863"}`;

export default function RegisterPage() {
  const [mode, setMode] = useState<PageMode>("input");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkLoad, setCheckLoad] = useState(false);

  // Input state
  const [orderId, setOrderId] = useState("");

  // New order state
  const [namaPembeli, setNama] = useState("");
  const [noWA, setNoWA] = useState("");
  const [qty, setQty] = useState(1);
  const [jemaahForms, setForms] = useState<
    (JemaahFormData & { filled: boolean })[]
  >([]);
  const [openIdx, setOpenIdx] = useState(0);

  // Resume state
  const [existingOrder, setOrder] = useState<Order | null>(null);
  const [existingVouchers, setVouchers] = useState<Voucher[]>([]);

  const showToast = useCallback((message: string, type: ToastState["type"]) => {
    setToast({ message, type });
  }, []);

  // ── STEP 1: CEK ORDER ID ────────────────────────────────────
  async function handleCheckOrder() {
    if (!orderId.trim()) {
      showToast("Masukkan Order ID terlebih dahulu.", "error");
      return;
    }
    setCheckLoad(true);
    try {
      const order = await getOrderById(orderId);
      if (order) {
        // Order sudah ada — load data voucher
        const vouchers = await getVouchersByOrderId(orderId);
        setOrder(order);
        setVouchers(vouchers);
        setMode("resume");
        showToast("Order ditemukan! Berikut data yang sudah ada.", "info");
      } else {
        // Order belum ada — form baru
        setMode("new");
        showToast(
          "Order ID baru. Silakan lengkapi data registrasi.",
          "success",
        );
      }
    } catch {
      // Jika Supabase error, treat sebagai order baru
      setMode("new");
      showToast("Order ID baru. Silakan lengkapi data registrasi.", "success");
    } finally {
      setCheckLoad(false);
    }
  }

  // ── STEP 2A: SUBMIT ORDER BARU ──────────────────────────────
  function handleGoToJemaah() {
    if (!namaPembeli.trim() || !noWA.trim()) {
      showToast("Lengkapi nama pembeli dan nomor WhatsApp.", "error");
      return;
    }
    setForms(
      Array.from({ length: qty }, () => ({
        nama_jemaah: "",
        kota_domisili: "",
        travel_tujuan: "",
        rencana_penggunaan: "",
        filled: false,
      })),
    );
    setOpenIdx(0);
    setMode("new");
  }

  function handleSaveJemaah(i: number, data: JemaahFormData) {
    const updated = [...jemaahForms];
    updated[i] = { ...data, filled: true };
    setForms(updated);
    showToast(
      `✓ Data ${data.nama_jemaah || `Jemaah ${i + 1}`} tersimpan!`,
      "success",
    );
    if (i + 1 < qty) setTimeout(() => setOpenIdx(i + 1), 300);
  }

  async function handleSubmitNew() {
    setLoading(true);
    try {
      await createOrder({
        order_id: orderId,
        nama_pembeli: namaPembeli,
        no_whatsapp: noWA,
        jumlah_voucher: qty,
      });
      const emptyJemaah = Array.from({ length: qty }, (_, i) => ({
        nama_jemaah: jemaahForms[i]?.nama_jemaah || "",
        kota_domisili: jemaahForms[i]?.kota_domisili || "",
        travel_tujuan: jemaahForms[i]?.travel_tujuan || "",
        rencana_penggunaan: jemaahForms[i]?.rencana_penggunaan || "",
      }));
      await createVouchers(orderId, emptyJemaah);
    } catch {
      /* offline/demo */
    } finally {
      setLoading(false);
      setMode("done");
      showToast("🎉 Registrasi berhasil dikirim!", "success");
    }
  }

  // ── STEP 2B: SIMPAN DATA JEMAAH YANG KOSONG (RESUME) ───────
  async function handleSaveResumeJemaah(
    voucher: Voucher,
    data: JemaahFormData,
  ) {
    setLoading(true);
    try {
      const result = await updateVoucherData(voucher.kode_unik, data);
      if (result.success) {
        const updated = existingVouchers.map((v) =>
          v.kode_unik === voucher.kode_unik ? { ...v, ...data } : v,
        );
        setVouchers(updated);
        showToast(`✓ Data ${data.nama_jemaah} berhasil disimpan!`, "success");
      } else {
        showToast("Gagal menyimpan. Coba lagi.", "error");
      }
    } catch {
      showToast("Gagal menyimpan. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  // ── RESET ───────────────────────────────────────────────────
  function handleReset() {
    setMode("input");
    setOrderId("");
    setNama("");
    setNoWA("");
    setQty(1);
    setForms([]);
    setOrder(null);
    setVouchers([]);
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(249,243,227,0.65)",
    marginBottom: "8px",
  };

  const filledCount = jemaahForms.filter((j) => j.filled).length;

  return (
    <>
      <div className="pattern-bg" />
      <div
        style={{
          position: "fixed",
          top: "-300px",
          left: "-200px",
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle,rgba(26,107,56,0.12) 0%,transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 6% 60px",
          maxWidth: "860px",
          margin: "0 auto",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div className="label-tag">📝 Registrasi Jemaah</div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(28px,4vw,42px)",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Daftarkan Data <span className="shimmer">Jemaah Anda</span>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "var(--cream-dim)",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Masukkan Order ID yang kamu terima dari link.id setelah pembayaran
            berhasil.
          </p>
        </div>

        {/* ══ MODE: INPUT ORDER ID ══ */}
        {mode === "input" && (
          <div
            className="glass"
            style={{ padding: "40px", animation: "scaleIn 0.4s ease forwards" }}
          >
            <div
              style={{
                background: "rgba(201,168,76,0.05)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: "14px",
                padding: "20px 24px",
                marginBottom: "32px",
                display: "flex",
                gap: "14px",
              }}
            >
              <span style={{ fontSize: "20px", flexShrink: 0 }}>💡</span>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(249,243,227,0.55)",
                  lineHeight: 1.7,
                }}
              >
                Masukkan <strong style={{ color: "#e8c96d" }}>Order ID</strong>{" "}
                dari link.id. Jika sudah pernah daftar sebelumnya, data lama
                akan ditampilkan kembali.
              </div>
            </div>

            <label style={labelStyle}>
              Order ID <span style={{ color: "#c9a84c" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
              <input
                className="form-input mono"
                placeholder="Contoh: ID.0003/II"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheckOrder()}
                style={{ letterSpacing: "1px", fontSize: "16px" }}
              />
              <button
                onClick={handleCheckOrder}
                disabled={checkLoad || orderId.length < 3}
                className="btn-gold"
                style={{
                  minWidth: "140px",
                  borderRadius: "12px",
                  padding: "0 24px",
                }}
              >
                {checkLoad ? "⏳ Mengecek..." : "🔍 Cek Order"}
              </button>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(249,243,227,0.28)",
                marginTop: "8px",
              }}
            >
              Order ID dapat ditemukan pada halaman sukses pembayaran atau email
              konfirmasi dari link.id.
            </p>
          </div>
        )}

        {/* ══ MODE: FORM BARU ══ */}
        {mode === "new" && (
          <div
            className="glass"
            style={{ padding: "40px", animation: "scaleIn 0.4s ease forwards" }}
          >
            {/* Header order ID */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "28px",
                padding: "14px 18px",
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "glow 1.5s ease infinite",
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: "14px", color: "rgba(249,243,227,0.6)" }}
              >
                Order ID baru:
              </span>
              <span
                className="mono"
                style={{
                  fontSize: "16px",
                  color: "#e8c96d",
                  letterSpacing: "1px",
                  fontWeight: 700,
                }}
              >
                {orderId.toUpperCase()}
              </span>
              <button
                onClick={handleReset}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: "rgba(249,243,227,0.3)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "'Tajawal',sans-serif",
                }}
              >
                ← Ganti
              </button>
            </div>

            {/* Data pembeli */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "22px",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Nama Pembeli <span style={{ color: "#c9a84c" }}>*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Nama lengkap pembeli"
                  value={namaPembeli}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  No. WhatsApp <span style={{ color: "#c9a84c" }}>*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="08xx-xxxx-xxxx"
                  value={noWA}
                  onChange={(e) => setNoWA(e.target.value)}
                />
              </div>
            </div>

            {/* Jumlah voucher */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>
                Jumlah Voucher / Jemaah{" "}
                <span style={{ color: "#c9a84c" }}>*</span>
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid rgba(201,168,76,0.18)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.04)",
                  width: "fit-content",
                }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  style={{
                    width: "44px",
                    height: "48px",
                    background: "rgba(201,168,76,0.06)",
                    border: "none",
                    color: "#e8c96d",
                    fontSize: "22px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  −
                </button>
                <div
                  className="serif"
                  style={{
                    width: "60px",
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#e8c96d",
                    borderLeft: "1px solid rgba(201,168,76,0.15)",
                    borderRight: "1px solid rgba(201,168,76,0.15)",
                    padding: "12px 0",
                  }}
                >
                  {qty}
                </div>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  disabled={qty >= 10}
                  style={{
                    width: "44px",
                    height: "48px",
                    background: "rgba(201,168,76,0.06)",
                    border: "none",
                    color: "#e8c96d",
                    fontSize: "22px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  +
                </button>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(249,243,227,0.35)",
                  marginTop: "8px",
                }}
              >
                Sesuaikan dengan jumlah voucher yang dibeli.
              </p>
            </div>

            <div className="divider" style={{ marginBottom: "28px" }} />

            {/* Form jemaah — opsional */}
            <div
              style={{
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "var(--cream)",
                  }}
                >
                  Data Jemaah{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "rgba(249,243,227,0.35)",
                      marginLeft: "8px",
                    }}
                  >
                    Opsional — bisa diisi sekarang atau nanti
                  </span>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(249,243,227,0.4)" }}>
                <strong style={{ color: "#e8c96d" }}>{filledCount}</strong> /{" "}
                {qty} terisi
              </div>
            </div>

            {/* Progress bar */}
            {qty > 0 && (
              <div
                style={{
                  height: "4px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "50px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg,#c9a84c,#e8c96d)",
                    borderRadius: "50px",
                    transition: "width 0.4s",
                    width: `${(filledCount / qty) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Inisialisasi form jemaah jika belum */}
            {jemaahForms.length === 0 && (
              <button
                onClick={() => {
                  if (!namaPembeli.trim() || !noWA.trim()) {
                    showToast("Isi nama pembeli dan nomor WA dulu.", "error");
                    return;
                  }
                  setForms(
                    Array.from({ length: qty }, () => ({
                      nama_jemaah: "",
                      kota_domisili: "",
                      travel_tujuan: "",
                      rencana_penggunaan: "",
                      filled: false,
                    })),
                  );
                  setOpenIdx(0);
                }}
                style={{
                  width: "100%",
                  background: "rgba(201,168,76,0.06)",
                  border: "1px dashed rgba(201,168,76,0.25)",
                  borderRadius: "12px",
                  padding: "16px",
                  color: "rgba(249,243,227,0.4)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "'Tajawal',sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
                  e.currentTarget.style.color = "#e8c96d";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                  e.currentTarget.style.color = "rgba(249,243,227,0.4)";
                }}
              >
                + Isi data jemaah sekarang (opsional)
              </button>
            )}

            {/* Jemaah cards */}
            {jemaahForms.length > 0 &&
              jemaahForms.map((j, i) => (
                <JemaahCard
                  key={i}
                  index={i}
                  data={j}
                  isOpen={openIdx === i}
                  onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
                  onSave={(data) => handleSaveJemaah(i, data)}
                  labelStyle={labelStyle}
                />
              ))}

            {/* Tombol submit */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              <button onClick={handleReset} className="btn-outline">
                ← Kembali
              </button>
              <button
                onClick={handleSubmitNew}
                disabled={loading || !namaPembeli.trim() || !noWA.trim()}
                className="btn-gold"
              >
                {loading ? "⏳ Mengirim..." : "🕌 Kirim Registrasi"}
              </button>
            </div>
          </div>
        )}

        {/* ══ MODE: RESUME (ORDER SUDAH ADA) ══ */}
        {mode === "resume" && existingOrder && (
          <div style={{ animation: "scaleIn 0.4s ease forwards" }}>
            {/* Info order */}
            <div
              style={{
                background: "rgba(96,165,250,0.06)",
                border: "1px solid rgba(96,165,250,0.2)",
                borderRadius: "16px",
                padding: "20px 24px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(249,243,227,0.35)",
                    letterSpacing: "1.5px",
                    marginBottom: "6px",
                  }}
                >
                  ORDER DITEMUKAN
                </div>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(249,243,227,0.35)",
                        marginBottom: "2px",
                      }}
                    >
                      Order ID
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: "15px",
                        color: "#e8c96d",
                        letterSpacing: "1px",
                        fontWeight: 700,
                      }}
                    >
                      {existingOrder.order_id}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(249,243,227,0.35)",
                        marginBottom: "2px",
                      }}
                    >
                      Pembeli
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600 }}>
                      {existingOrder.nama_pembeli}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(249,243,227,0.35)",
                        marginBottom: "2px",
                      }}
                    >
                      Jumlah Voucher
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#22c55e",
                      }}
                    >
                      {existingOrder.jumlah_voucher} jemaah
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(249,243,227,0.35)",
                        marginBottom: "2px",
                      }}
                    >
                      Status
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        padding: "3px 10px",
                        borderRadius: "50px",
                        display: "inline-block",
                        background:
                          existingOrder.status === "active"
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(234,179,8,0.1)",
                        border: `1px solid ${existingOrder.status === "active" ? "rgba(34,197,94,0.3)" : "rgba(234,179,8,0.3)"}`,
                        color:
                          existingOrder.status === "active"
                            ? "#22c55e"
                            : "#eab308",
                        fontWeight: 600,
                      }}
                    >
                      {existingOrder.status === "active"
                        ? "✓ Aktif"
                        : "⏳ Pending"}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: "none",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "8px",
                  color: "rgba(249,243,227,0.4)",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "8px 16px",
                  fontFamily: "'Tajawal',sans-serif",
                }}
              >
                ← Ganti Order ID
              </button>
            </div>

            {/* Voucher cards */}
            <div
              style={{
                marginBottom: "8px",
                fontSize: "13px",
                color: "rgba(249,243,227,0.35)",
                letterSpacing: "1.5px",
              }}
            >
              DATA JEMAAH
            </div>
            {existingVouchers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "rgba(249,243,227,0.25)",
                  fontSize: "14px",
                }}
              >
                ⏳ Memuat data jemaah...
              </div>
            ) : (
              existingVouchers.map((v, i) => (
                <ResumeCard
                  key={v.id}
                  index={i}
                  voucher={v}
                  onSave={(data) => handleSaveResumeJemaah(v, data)}
                  loading={loading}
                  labelStyle={labelStyle}
                />
              ))
            )}

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/tracking" className="btn-outline">
                🔍 Cek Status Voucher
              </Link>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                style={{ textDecoration: "none" }}
              >
                💬 Hubungi Admin
              </a>
            </div>
          </div>
        )}

        {/* ══ MODE: DONE ══ */}
        {mode === "done" && (
          <div
            className="glass"
            style={{
              padding: "40px",
              textAlign: "center",
              animation: "scaleIn 0.4s ease forwards",
            }}
          >
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                background: "rgba(34,197,94,0.1)",
                border: "2px solid rgba(34,197,94,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 28px",
                animation: "checkPop 0.5s ease forwards",
              }}
            >
              ✓
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Registrasi <span className="shimmer">Berhasil!</span>
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "var(--cream-dim)",
                lineHeight: 1.75,
                maxWidth: "440px",
                margin: "0 auto 28px",
              }}
            >
              Data kamu sudah kami terima dan sedang menunggu konfirmasi. Tim
              kami akan menghubungi via WhatsApp setelah voucher diaktifkan.
            </p>

            {/* Summary */}
            <div
              style={{
                background: "rgba(7,26,15,0.7)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: "16px",
                padding: "20px 28px",
                textAlign: "left",
                marginBottom: "20px",
              }}
            >
              {[
                { label: "Order ID", value: orderId.toUpperCase(), mono: true },
                { label: "Nama Pembeli", value: namaPembeli, mono: false },
                { label: "WhatsApp", value: noWA, mono: false },
                { label: "Jumlah Jemaah", value: `${qty} orang`, mono: false },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(201,168,76,0.07)",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "rgba(249,243,227,0.4)" }}>
                    {r.label}
                  </span>
                  <span
                    className={r.mono ? "mono" : ""}
                    style={{
                      fontWeight: 600,
                      color: r.mono ? "#e8c96d" : "var(--cream)",
                      fontSize: "13px",
                    }}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "rgba(249,243,227,0.4)" }}>Status</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(234,179,8,0.1)",
                    border: "1px solid rgba(234,179,8,0.25)",
                    color: "#eab308",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: "50px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#eab308",
                      animation: "glow 1.5s ease infinite",
                    }}
                  />
                  MENUNGGU KONFIRMASI
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(201,168,76,0.05)",
                border: "1px solid rgba(201,168,76,0.12)",
                borderRadius: "12px",
                padding: "14px 18px",
                marginBottom: "24px",
                fontSize: "14px",
                color: "rgba(249,243,227,0.5)",
                lineHeight: 1.7,
                textAlign: "left",
              }}
            >
              💡 Data jemaah yang belum diisi bisa dilengkapi kapanpun dengan
              kembali ke halaman ini dan memasukkan Order ID yang sama.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <button onClick={handleReset} className="btn-outline">
                📝 Daftar Lagi
              </button>
              <Link
                href="/tracking"
                className="btn-gold"
                style={{ textDecoration: "none" }}
              >
                🔍 Cek Status Voucher
              </Link>
            </div>
          </div>
        )}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

// ══ JEMAAH CARD (Form Baru) ═══════════════════════════════════
function JemaahCard({
  index,
  data,
  isOpen,
  onToggle,
  onSave,
  labelStyle,
}: {
  index: number;
  data: JemaahFormData & { filled: boolean };
  isOpen: boolean;
  onToggle: () => void;
  onSave: (d: JemaahFormData) => void;
  labelStyle: React.CSSProperties;
}) {
  const [form, setForm] = useState<JemaahFormData>({
    nama_jemaah: data.nama_jemaah,
    kota_domisili: data.kota_domisili,
    travel_tujuan: data.travel_tujuan,
    rencana_penggunaan: data.rencana_penggunaan,
  });
  return (
    <div
      style={{
        border: "1px solid rgba(201,168,76,0.12)",
        borderRadius: "16px",
        marginBottom: "12px",
        overflow: "hidden",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "rgba(13,61,30,0.4)",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: data.filled
                ? "rgba(34,197,94,0.1)"
                : "rgba(201,168,76,0.1)",
              border: `1px solid ${data.filled ? "rgba(34,197,94,0.3)" : "rgba(201,168,76,0.25)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Playfair Display',serif",
              fontWeight: 700,
              fontSize: "13px",
              color: data.filled ? "#22c55e" : "#c9a84c",
              flexShrink: 0,
            }}
          >
            {data.filled ? "✓" : index + 1}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700 }}>
            {data.filled ? data.nama_jemaah : `Jemaah ke-${index + 1}`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "50px",
              fontWeight: 600,
              background: data.filled
                ? "rgba(34,197,94,0.08)"
                : "rgba(201,168,76,0.08)",
              border: `1px solid ${data.filled ? "rgba(34,197,94,0.2)" : "rgba(201,168,76,0.2)"}`,
              color: data.filled ? "#22c55e" : "#c9a84c",
            }}
          >
            {data.filled ? "Terisi ✓" : "Kosong"}
          </span>
          <span
            style={{
              color: "rgba(249,243,227,0.3)",
              fontSize: "16px",
              transition: "transform 0.3s",
              display: "inline-block",
              transform: isOpen ? "rotate(180deg)" : "none",
            }}
          >
            ▾
          </span>
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: "20px", background: "rgba(255,255,255,0.015)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <input
                className="form-input"
                placeholder="Nama sesuai paspor"
                value={form.nama_jemaah}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nama_jemaah: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Kota Domisili</label>
              <input
                className="form-input"
                placeholder="Contoh: Makassar"
                value={form.kota_domisili}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kota_domisili: e.target.value }))
                }
              />
            </div>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Travel Tujuan</label>
            <input
              className="form-input"
              placeholder="Nama travel yang akan digunakan"
              value={form.travel_tujuan}
              onChange={(e) =>
                setForm((f) => ({ ...f, travel_tujuan: e.target.value }))
              }
            />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Rencana Penggunaan</label>
            <input
              className="form-input"
              type="date"
              value={form.rencana_penggunaan}
              onChange={(e) =>
                setForm((f) => ({ ...f, rencana_penggunaan: e.target.value }))
              }
            />
          </div>
          <button
            onClick={() => {
              if (form.nama_jemaah) onSave(form);
            }}
            className="btn-gold"
            style={{
              maxWidth: "180px",
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            Simpan ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ══ RESUME CARD (Order Sudah Ada) ═════════════════════════════
function ResumeCard({
  index,
  voucher,
  onSave,
  loading,
  labelStyle,
}: {
  index: number;
  voucher: Voucher;
  onSave: (d: JemaahFormData) => void;
  loading: boolean;
  labelStyle: React.CSSProperties;
}) {
  const isEmpty =
    !voucher.nama_jemaah && !voucher.kota_domisili && !voucher.travel_tujuan;
  const [isOpen, setIsOpen] = useState(isEmpty);
  const [form, setForm] = useState<JemaahFormData>({
    nama_jemaah: voucher.nama_jemaah || "",
    kota_domisili: voucher.kota_domisili || "",
    travel_tujuan: voucher.travel_tujuan || "",
    rencana_penggunaan: voucher.rencana_penggunaan || "",
  });

  return (
    <div
      style={{
        border: `1px solid ${isEmpty ? "rgba(234,179,8,0.2)" : "rgba(201,168,76,0.12)"}`,
        borderRadius: "16px",
        marginBottom: "12px",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: isEmpty ? "rgba(234,179,8,0.05)" : "rgba(13,61,30,0.4)",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: isEmpty
                ? "rgba(234,179,8,0.1)"
                : "rgba(34,197,94,0.1)",
              border: `1px solid ${isEmpty ? "rgba(234,179,8,0.3)" : "rgba(34,197,94,0.3)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Playfair Display',serif",
              fontWeight: 700,
              fontSize: "13px",
              color: isEmpty ? "#eab308" : "#22c55e",
              flexShrink: 0,
            }}
          >
            {isEmpty ? "!" : "✓"}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>
              {voucher.nama_jemaah || `Jemaah ke-${index + 1}`}
            </div>
            <div
              className="mono"
              style={{
                fontSize: "11px",
                color: "rgba(249,243,227,0.35)",
                letterSpacing: "1px",
                marginTop: "2px",
              }}
            >
              {voucher.kode_unik}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "50px",
              fontWeight: 600,
              background: isEmpty
                ? "rgba(234,179,8,0.08)"
                : "rgba(34,197,94,0.08)",
              border: `1px solid ${isEmpty ? "rgba(234,179,8,0.2)" : "rgba(34,197,94,0.2)"}`,
              color: isEmpty ? "#eab308" : "#22c55e",
            }}
          >
            {isEmpty ? "⚠ Belum diisi" : "✓ Terisi"}
          </span>
          <span
            style={{
              color: "rgba(249,243,227,0.3)",
              fontSize: "16px",
              transition: "transform 0.3s",
              display: "inline-block",
              transform: isOpen ? "rotate(180deg)" : "none",
            }}
          >
            ▾
          </span>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: "20px", background: "rgba(255,255,255,0.015)" }}>
          {!isEmpty ? (
            // VIEW ONLY — data sudah terisi
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "14px",
                }}
              >
                {[
                  { label: "Nama Lengkap", value: voucher.nama_jemaah },
                  { label: "Kota Domisili", value: voucher.kota_domisili },
                  { label: "Travel Tujuan", value: voucher.travel_tujuan },
                  {
                    label: "Rencana Penggunaan",
                    value: voucher.rencana_penggunaan,
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(249,243,227,0.35)",
                        letterSpacing: "1.5px",
                        marginBottom: "6px",
                      }}
                    >
                      {f.label.toUpperCase()}
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(201,168,76,0.1)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontSize: "14px",
                        color: f.value
                          ? "var(--cream)"
                          : "rgba(249,243,227,0.2)",
                      }}
                    >
                      {f.value || "—"}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "rgba(249,243,227,0.3)",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "8px",
                }}
              >
                🔒 Data terkunci — hubungi admin via WhatsApp jika perlu
                perubahan
              </div>
            </div>
          ) : (
            // FORM — data masih kosong, bisa diisi
            <div>
              <div
                style={{
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#eab308",
                }}
              >
                ⚠ Data jemaah ini belum diisi — lengkapi sekarang atau nanti.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input
                    className="form-input"
                    placeholder="Nama sesuai paspor"
                    value={form.nama_jemaah}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nama_jemaah: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kota Domisili</label>
                  <input
                    className="form-input"
                    placeholder="Contoh: Makassar"
                    value={form.kota_domisili}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, kota_domisili: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Travel Tujuan</label>
                <input
                  className="form-input"
                  placeholder="Nama travel yang akan digunakan"
                  value={form.travel_tujuan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, travel_tujuan: e.target.value }))
                  }
                />
              </div>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Rencana Penggunaan</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.rencana_penggunaan}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      rencana_penggunaan: e.target.value,
                    }))
                  }
                />
              </div>
              <button
                onClick={() => {
                  if (form.nama_jemaah) onSave(form);
                }}
                disabled={loading || !form.nama_jemaah}
                className="btn-gold"
                style={{
                  maxWidth: "180px",
                  padding: "10px 20px",
                  fontSize: "14px",
                }}
              >
                {loading ? "⏳..." : "Simpan ✓"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
