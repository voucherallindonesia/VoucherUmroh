"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import DigitalCard from "@/components/voucher/DigitalCard";
import {
  getVoucherByKode,
  getVouchersByOrderId,
  getOrderById,
} from "@/lib/supabase";
import type { Voucher, Order } from "@/types";

type ToastState = { message: string; type: "success" | "error" | "info" };
type ResultMode = "single" | "multi" | "pending" | "used" | "notfound" | null;

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || "6285167060863"}`;

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "var(--green-deep)" }} />
      }
    >
      <TrackingContent />
    </Suspense>
  );
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [resultMode, setMode] = useState<ResultMode>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [dlLoading, setDlLoad] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const showToast = useCallback(
    (m: string, t: ToastState["type"]) => setToast({ message: m, type: t }),
    [],
  );

  // ── Auto-search jika ada ?code= di URL ───────────────────────
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam.toUpperCase());
      setTimeout(() => doSearch(codeParam.toUpperCase()), 200);
    }
  }, []);

  // ── Auto detect format ────────────────────────────────────────
  function detectFormat(input: string): "order" | "voucher" {
    const v = input.trim().toUpperCase();
    const parts = v.split("-");
    // Kode voucher: ID.XXXX-XX-XXXX (3 bagian setelah split strip)
    if (v.startsWith("ID.") && parts.length >= 3) return "voucher";
    // Order ID: ID.XXXX/XX (mengandung slash)
    if (v.startsWith("ID.") && v.includes("/")) return "order";
    return "voucher";
  }

  async function doSearch(searchCode?: string) {
    const input = (searchCode || code).trim().toUpperCase();
    if (!input) return;

    setLoading(true);
    setMode(null);

    try {
      const fmt = detectFormat(input);

      // Cari by Kode Voucher dulu
      if (fmt === "voucher") {
        const v = await getVoucherByKode(input);
        if (v) {
          setVoucher(v);
          const msgs: Record<string, string> = {
            active: "✓ Voucher aktif ditemukan!",
            pending: "⏳ Voucher menunggu konfirmasi.",
            used: "Voucher ini sudah pernah digunakan.",
            rejected: "Voucher ditolak.",
          };
          const types: Record<string, ToastState["type"]> = {
            active: "success",
            pending: "info",
            used: "info",
            rejected: "error",
          };
          setMode(
            v.status === "active"
              ? "single"
              : v.status === "pending"
                ? "pending"
                : "used",
          );
          showToast(msgs[v.status] || "—", types[v.status] || "info");
          setLoading(false);
          return;
        }
      }

      // Cari by Order ID
      if (fmt === "order") {
        const orderData = await getOrderById(input);
        if (orderData) {
          const vs = await getVouchersByOrderId(input);
          setOrder(orderData);
          setVouchers(vs);
          setMode("multi");
          showToast(`✓ Order ditemukan — ${vs.length} voucher`, "success");
          setLoading(false);
          return;
        }
      }

      setMode("notfound");
      showToast("Kode tidak ditemukan. Periksa kembali.", "error");
    } catch {
      setMode("notfound");
      showToast("Gagal terhubung. Periksa koneksi internet.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(v: Voucher) {
    const ref = cardRefs.current[v.kode_unik];
    if (!ref) {
      showToast("Kartu belum siap. Tunggu sebentar lalu coba lagi.", "error");
      return;
    }
    setDlLoad(v.kode_unik);
    try {
      const { default: html2canvas } = await import("html2canvas");

      // Tunggu semua gambar dalam card selesai load
      // Tunggu semua gambar selesai load
      const images = ref.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              }),
        ),
      );

      // Fix QR Code canvas width/height = 0
      // Konversi semua canvas di dalam card menjadi <img> sebelum di-render
      const canvases = ref.querySelectorAll("canvas");
      canvases.forEach((canvas) => {
        if (canvas.width === 0 || canvas.height === 0) {
          canvas.width = 70;
          canvas.height = 70;
          return;
        }
        try {
          const dataUrl = canvas.toDataURL("image/png");
          const img = document.createElement("img");
          img.src = dataUrl;
          img.width = canvas.width;
          img.height = canvas.height;
          img.style.cssText = canvas.style.cssText;
          canvas.parentNode?.replaceChild(img, canvas);
        } catch {}
      });

      // Tunggu sebentar agar semua perubahan DOM ter-apply
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(ref, {
        scale: 2,
        backgroundColor: "#031a0a",
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 5000,
        onclone: (clonedDoc) => {
          // Set willReadFrequently pada semua canvas di clone
          clonedDoc.querySelectorAll("canvas").forEach((c) => {
            c.getContext("2d", { willReadFrequently: true });
          });
        },
      });

      const link = document.createElement("a");
      link.download = `VoucherUmroh-${v.kode_unik}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("✓ Kartu berhasil diunduh!", "success");
    } catch (err) {
      console.error("Download error:", err);
      showToast("Gagal mengunduh. Coba lagi.", "error");
    } finally {
      setDlLoad(null);
    }
  }

  function handleClear() {
    setMode(null);
    setCode("");
    setVoucher(null);
    setVouchers([]);
    setOrder(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState({}, "", window.location.pathname);
  }

  const actionRow = (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "20px",
      }}
    >
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(37,211,102,0.1)",
          color: "#25d366",
          padding: "12px 24px",
          borderRadius: "50px",
          border: "1.5px solid rgba(37,211,102,0.25)",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        💬 Hubungi Admin
      </a>
      <button onClick={handleClear} className="btn-outline">
        🔍 Cek Lain
      </button>
    </div>
  );

  return (
    <>
      <div className="pattern-bg" />
      <div
        style={{
          position: "fixed",
          top: "-300px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "600px",
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
          padding: "100px 6% 80px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div className="label-tag">🔍 Tracking Voucher</div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(28px,4vw,44px)",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Cek Status <span className="shimmer">Voucher Anda</span>
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
            Masukkan <strong style={{ color: "#e8c96d" }}>Kode Voucher</strong>{" "}
            atau <strong style={{ color: "#e8c96d" }}>Order ID</strong>, atau
            scan QR Code dari kartu digital Anda.
          </p>
        </div>

        {/* SEARCH BOX */}
        <div
          className="glass"
          style={{ padding: "36px 40px", marginBottom: "32px" }}
        >
          <div
            style={{
              background: "rgba(201,168,76,0.05)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>📋</span>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(249,243,227,0.5)",
                lineHeight: 1.8,
              }}
            >
              Masukkan{" "}
              <strong style={{ color: "#e8c96d" }}>Kode Voucher</strong> yang
              tertera pada kartu digital Anda untuk melihat status voucher
              tersebut, atau masukkan{" "}
              <strong style={{ color: "#e8c96d" }}>Order ID</strong> yang
              diterima setelah pembayaran untuk melihat seluruh voucher dalam
              satu order.
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <input
              className="form-input mono"
              placeholder="Ketik Kode Voucher atau Order ID..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              style={{
                fontSize: "16px",
                letterSpacing: "1px",
                padding: "16px 20px",
              }}
            />
            <button
              onClick={() => doSearch()}
              disabled={loading || code.length < 3}
              className="btn-gold"
              style={{
                height: "56px",
                minWidth: "140px",
                borderRadius: "14px",
                fontSize: "15px",
              }}
            >
              {loading ? "⏳..." : "🔍 Cek"}
            </button>
          </div>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "rgba(249,243,227,0.25)",
            }}
          >
            <span>📱</span>
            <span>
              Scan QR Code dari kartu digital → otomatis menampilkan status
              voucher
            </span>
          </div>
        </div>

        {/* ── NOT FOUND ── */}
        {resultMode === "notfound" && (
          <div
            style={{
              background: "rgba(255,80,80,0.04)",
              border: "1px solid rgba(255,100,100,0.15)",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
              animation: "scaleIn 0.4s ease",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
            <div
              className="serif"
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "10px",
                color: "rgba(255,130,130,0.85)",
              }}
            >
              Tidak Ditemukan
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--cream-dim)",
                lineHeight: 1.75,
                marginBottom: "20px",
              }}
            >
              <strong
                className="mono"
                style={{ color: "var(--cream)", letterSpacing: "1px" }}
              >
                {code}
              </strong>{" "}
              tidak ditemukan dalam sistem kami. Pastikan kode diketik dengan
              benar.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(37,211,102,0.1)",
                  color: "#25d366",
                  padding: "12px 24px",
                  borderRadius: "50px",
                  border: "1.5px solid rgba(37,211,102,0.25)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                💬 Hubungi Admin
              </a>
              <button onClick={handleClear} className="btn-outline">
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* ── PENDING ── */}
        {resultMode === "pending" && voucher && (
          <div
            style={{
              background: "rgba(234,179,8,0.04)",
              border: "1px solid rgba(234,179,8,0.2)",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
              animation: "scaleIn 0.4s ease",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(234,179,8,0.08)",
                border: "1.5px solid rgba(234,179,8,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                margin: "0 auto 20px",
              }}
            >
              ⏳
            </div>
            <div
              className="serif"
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "10px",
                color: "#eab308",
              }}
            >
              Menunggu Konfirmasi
            </div>
            <p
              style={{
                fontSize: "15px",
                color: "var(--cream-dim)",
                lineHeight: 1.75,
                marginBottom: "8px",
              }}
            >
              Voucher{" "}
              <strong className="mono" style={{ color: "#e8c96d" }}>
                {voucher.kode_unik}
              </strong>{" "}
              sedang diverifikasi oleh admin.
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(249,243,227,0.4)",
                marginBottom: "28px",
              }}
            >
              Estimasi <strong style={{ color: "#eab308" }}>1×24 jam</strong> di
              hari kerja.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(37,211,102,0.1)",
                  color: "#25d366",
                  padding: "12px 24px",
                  borderRadius: "50px",
                  border: "1.5px solid rgba(37,211,102,0.25)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                💬 Tanya Status ke Admin
              </a>
              <button onClick={handleClear} className="btn-outline">
                Cek Lain
              </button>
            </div>
          </div>
        )}

        {/* ── USED ── */}
        {resultMode === "used" && voucher && (
          <div
            style={{
              background: "rgba(100,100,100,0.04)",
              border: "1px solid rgba(150,150,150,0.15)",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
              animation: "scaleIn 0.4s ease",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✓</div>
            <div
              className="serif"
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "10px",
                color: "rgba(249,243,227,0.5)",
              }}
            >
              Voucher Telah Digunakan
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(249,243,227,0.35)",
                lineHeight: 1.75,
                marginBottom: "24px",
              }}
            >
              Voucher <strong className="mono">{voucher.kode_unik}</strong> atas
              nama{" "}
              <strong style={{ color: "var(--cream)" }}>
                {voucher.nama_jemaah || "—"}
              </strong>{" "}
              telah berhasil digunakan. Terima kasih sudah mempercayai Voucher
              Umroh 🕋
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href={process.env.NEXT_PUBLIC_PAYMENT_URL || "https://link.id"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ textDecoration: "none" }}
              >
                🛒 Beli Voucher Lagi
              </a>
              <button onClick={handleClear} className="btn-outline">
                Cek Lain
              </button>
            </div>
          </div>
        )}

        {/* ── SINGLE VOUCHER ── */}
        {resultMode === "single" && voucher && (
          <div style={{ animation: "cardReveal 0.5s ease forwards" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#22c55e",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: "50px",
                  letterSpacing: "0.5px",
                }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    animation: "glow 1.5s ease infinite",
                  }}
                />
                VOUCHER AKTIF & SIAP DIGUNAKAN
              </div>
              <button
                onClick={() => handleDownload(voucher)}
                disabled={dlLoading === voucher.kode_unik}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg,#b8913e,#e8c96d,#b8913e)",
                  backgroundSize: "200% auto",
                  color: "#030f08",
                  fontFamily: "'Tajawal',sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "10px 24px",
                  border: "none",
                  borderRadius: "50px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  opacity: dlLoading === voucher.kode_unik ? 0.5 : 1,
                }}
              >
                {dlLoading === voucher.kode_unik
                  ? "⏳ Menyiapkan..."
                  : "⬇ Unduh Kartu Digital"}
              </button>
            </div>

            <div
              style={{
                width: "100%",
                overflowX: "auto",
                borderRadius: "20px",
                border: "1px solid rgba(201,168,76,0.3)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
                marginBottom: "16px",
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[voucher.kode_unik] = el;
                }}
                style={{ width: "780px" }}
              >
                <DigitalCard voucher={voucher} />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {[
                {
                  label: "ORDER ID",
                  value: voucher.order_id,
                  mono: true,
                  green: false,
                },
                {
                  label: "TERDAFTAR",
                  value: new Date(voucher.created_at).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" },
                  ),
                  mono: false,
                  green: false,
                },
                { label: "STATUS", value: "✓ Aktif", mono: false, green: true },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(201,168,76,0.1)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "1.5px",
                      color: "rgba(249,243,227,0.3)",
                      marginBottom: "4px",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    className={s.mono ? "mono" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: s.green
                        ? "#22c55e"
                        : s.mono
                          ? "#e8c96d"
                          : "var(--cream)",
                      letterSpacing: s.mono ? "1px" : "normal",
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {(!voucher.nama_jemaah || !voucher.travel_tujuan) && (
              <div
                style={{
                  background: "rgba(201,168,76,0.05)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "16px" }}>📝</span>
                <div
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    color: "rgba(249,243,227,0.5)",
                    lineHeight: 1.6,
                  }}
                >
                  Data jemaah belum lengkap. Kunjungi halaman{" "}
                  <strong style={{ color: "#e8c96d" }}>Registrasi</strong> untuk
                  melengkapi.
                </div>
                <Link
                  href="/register"
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "#e8c96d",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ke Registrasi →
                </Link>
              </div>
            )}

            {actionRow}
          </div>
        )}

        {/* ── MULTI VOUCHER (ORDER ID) ── */}
        {resultMode === "multi" && order && (
          <div style={{ animation: "cardReveal 0.5s ease forwards" }}>
            <div
              style={{
                background: "rgba(96,165,250,0.06)",
                border: "1px solid rgba(96,165,250,0.2)",
                borderRadius: "16px",
                padding: "20px 24px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(249,243,227,0.35)",
                  letterSpacing: "1.5px",
                  marginBottom: "10px",
                }}
              >
                DETAIL ORDER
              </div>
              <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                {[
                  {
                    label: "Order ID",
                    value: order.order_id,
                    mono: true,
                    green: false,
                  },
                  {
                    label: "Pembeli",
                    value: order.nama_pembeli,
                    mono: false,
                    green: false,
                  },
                  {
                    label: "Total Voucher",
                    value: `${order.jumlah_voucher} jemaah`,
                    mono: false,
                    green: false,
                  },
                  {
                    label: "Status",
                    value: order.status === "active" ? "✓ Aktif" : "⏳ Pending",
                    mono: false,
                    green: order.status === "active",
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(249,243,227,0.35)",
                        marginBottom: "3px",
                      }}
                    >
                      {f.label}
                    </div>
                    <div
                      className={f.mono ? "mono" : ""}
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: f.green
                          ? "#22c55e"
                          : f.mono
                            ? "#e8c96d"
                            : "var(--cream)",
                      }}
                    >
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(201,168,76,0.04)",
                border: "1px solid rgba(201,168,76,0.12)",
                borderRadius: "12px",
                padding: "14px 20px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span>💡</span>
              <div
                style={{
                  flex: 1,
                  fontSize: "13px",
                  color: "rgba(249,243,227,0.45)",
                  lineHeight: 1.6,
                }}
              >
                Untuk mengisi atau mengubah data jemaah, kunjungi halaman{" "}
                <strong style={{ color: "#e8c96d" }}>Registrasi</strong> dan
                masukkan Order ID yang sama.
              </div>
              <Link
                href="/register"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "#e8c96d",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Ke Registrasi →
              </Link>
            </div>

            <div
              style={{
                marginBottom: "8px",
                fontSize: "13px",
                color: "rgba(249,243,227,0.35)",
                letterSpacing: "1.5px",
              }}
            >
              DAFTAR VOUCHER ({vouchers.length})
            </div>

            <MultiVoucherList
              vouchers={vouchers}
              cardRefs={cardRefs}
              dlLoading={dlLoading}
              onDownload={handleDownload}
            />

            {actionRow}
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

// ══ MULTI VOUCHER LIST ════════════════════════════════════════
function MultiVoucherList({
  vouchers,
  cardRefs,
  dlLoading,
  onDownload,
}: {
  vouchers: Voucher[];
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  dlLoading: string | null;
  onDownload: (v: Voucher) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sColor = (s: string) =>
    ({
      pending: "#eab308",
      active: "#22c55e",
      used: "rgba(249,243,227,0.4)",
      rejected: "rgba(255,130,130,0.8)",
    })[s] || "#888";
  const sLabel = (s: string) =>
    ({
      pending: "⏳ Pending",
      active: "✓ Aktif",
      used: "✓ Terpakai",
      rejected: "✗ Ditolak",
    })[s] || s;
  const sBg = (s: string) =>
    ({
      pending: "rgba(234,179,8,0.08)",
      active: "rgba(34,197,94,0.08)",
      used: "rgba(255,255,255,0.04)",
      rejected: "rgba(255,80,80,0.08)",
    })[s] || "rgba(255,255,255,0.04)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginBottom: "8px",
      }}
    >
      {vouchers.map((v) => (
        <div
          key={v.id}
          style={{
            border: `1px solid ${v.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(201,168,76,0.1)"}`,
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div
            onClick={() =>
              v.status === "active" &&
              setExpanded(expanded === v.kode_unik ? null : v.kode_unik)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 20px",
              background:
                v.status === "active"
                  ? "rgba(34,197,94,0.04)"
                  : "rgba(13,61,30,0.4)",
              cursor: v.status === "active" ? "pointer" : "default",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
                minWidth: "200px",
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: "12px",
                  color: "#e8c96d",
                  letterSpacing: "1px",
                  fontWeight: 700,
                }}
              >
                {v.kode_unik}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "50px",
                  background: sBg(v.status),
                  border: `1px solid ${sColor(v.status)}44`,
                  color: sColor(v.status),
                  fontWeight: 600,
                }}
              >
                {sLabel(v.status)}
              </span>
            </div>

            <div
              style={{
                fontSize: "13px",
                color: v.nama_jemaah
                  ? "var(--cream)"
                  : "rgba(249,243,227,0.25)",
                fontStyle: v.nama_jemaah ? "normal" : "italic",
              }}
            >
              {v.nama_jemaah || "Belum diisi"}
              {v.kota_domisili && (
                <span style={{ color: "rgba(249,243,227,0.4)" }}>
                  {" "}
                  · {v.kota_domisili}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              {v.status === "active" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(v);
                  }}
                  disabled={dlLoading === v.kode_unik}
                  style={{
                    background: "linear-gradient(135deg,#b8913e,#e8c96d)",
                    color: "#030f08",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Tajawal',sans-serif",
                  }}
                >
                  {dlLoading === v.kode_unik ? "⏳..." : "⬇ Unduh"}
                </button>
              )}
              {v.status === "active" && (
                <span
                  style={{
                    color: "rgba(249,243,227,0.3)",
                    fontSize: "14px",
                    transition: "transform 0.3s",
                    display: "inline-block",
                    transform:
                      expanded === v.kode_unik ? "rotate(180deg)" : "none",
                  }}
                >
                  ▾
                </span>
              )}
            </div>
          </div>

          {expanded === v.kode_unik && v.status === "active" && (
            <div style={{ padding: "16px", background: "rgba(0,0,0,0.2)" }}>
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                  borderRadius: "14px",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <div
                  ref={(el) => {
                    cardRefs.current[v.kode_unik] = el;
                  }}
                  style={{ width: "780px" }}
                >
                  <DigitalCard voucher={v} />
                </div>
              </div>
            </div>
          )}

          {expanded === v.kode_unik && v.status === "pending" && (
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(0,0,0,0.2)",
                fontSize: "14px",
                color: "rgba(249,243,227,0.4)",
              }}
            >
              ⏳ Menunggu konfirmasi admin. Estimasi 1×24 jam di hari kerja.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
