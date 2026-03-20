"use client";

import { useRef, useEffect } from "react";
import type { Voucher } from "@/types";

interface DigitalCardProps {
  voucher: Voucher;
}

// ── Build tracking URL untuk QR Code ─────────────────────────
function buildTrackingUrl(kodeUnik: string): string {
  // Base URL dari environment atau fallback
  const base =
    typeof window !== "undefined"
      ? window.location.origin +
        (window.location.pathname.includes("VoucherUmroh")
          ? "/VoucherUmroh"
          : "")
      : "https://voucherallindonesia.github.io/VoucherUmroh";

  return `${base}/tracking?code=${encodeURIComponent(kodeUnik)}`;
}

export default function DigitalCard({ voucher }: DigitalCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const rencanaFmt = voucher.rencana_penggunaan
    ? new Date(voucher.rencana_penggunaan).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  // ── Generate QR Code setelah mount ───────────────────────────
  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = "";

    const url = buildTrackingUrl(voucher.kode_unik);

    // Dynamically load QRCode library
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
      if (!qrRef.current) return;
      try {
        // @ts-ignore
        new window.QRCode(qrRef.current, {
          text: url,
          width: 70,
          height: 70,
          colorDark: "#030f08",
          colorLight: "#ffffff",
          // @ts-ignore
          correctLevel: window.QRCode?.CorrectLevel?.M || 1,
        });
      } catch {
        renderFallback(qrRef.current, voucher.kode_unik);
      }
    };
    script.onerror = () => {
      if (qrRef.current) renderFallback(qrRef.current, voucher.kode_unik);
    };

    // Check if already loaded
    // @ts-ignore
    if (window.QRCode) {
      script.onload?.({} as Event);
    } else {
      document.head.appendChild(script);
    }

    return () => {
      try {
        document.head.removeChild(script);
      } catch {}
    };
  }, [voucher.kode_unik]);

  return (
    <div
      id="digitalCard"
      style={{
        width: "780px",
        height: "460px",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(145deg,#031a0a 0%,#052e12 35%,#031a0a 100%)",
        borderRadius: "20px",
        fontFamily: "'Tajawal',sans-serif",
      }}
    >
      {/* Hex background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpath d='M30 0l15 26-15 26-15-26z' fill='none' stroke='%23c9a84c' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 52px",
        }}
      />

      {/* Glows */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-80px",
          width: "320px",
          height: "320px",
          background:
            "radial-gradient(circle,rgba(0,200,100,0.12) 0%,transparent 65%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          right: "200px",
          width: "240px",
          height: "240px",
          background:
            "radial-gradient(circle,rgba(201,168,76,0.1) 0%,transparent 65%)",
          borderRadius: "50%",
        }}
      />

      {/* Right islamic panel */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "230px",
          background: "linear-gradient(135deg,#1a3a7a,#2a4a9a,#1a3a7a)",
          clipPath: "polygon(18% 0%,100% 0%,100% 100%,0% 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect x='10' y='2' width='20' height='36' rx='2' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='1.5'/%3E%3Crect x='2' y='10' width='36' height='20' rx='2' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='1.5'/%3E%3Ccircle cx='20' cy='20' r='6' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
            opacity: 0.7,
          }}
        />
      </div>

      {/* Gold accent lines */}
      <div
        style={{
          position: "absolute",
          top: "52px",
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(90deg,transparent 0%,#c9a84c 30%,#e8c96d 55%,transparent 85%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "58px",
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg,transparent 0%,rgba(201,168,76,0.4) 30%,transparent 75%)",
        }}
      />

      {/* Top arc */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50px",
          right: "230px",
          height: "56px",
          borderBottom: "1.5px solid rgba(201,168,76,0.5)",
          borderLeft: "1.5px solid rgba(201,168,76,0.3)",
          borderRight: "1.5px solid rgba(201,168,76,0.3)",
          borderRadius: "0 0 50% 50%",
        }}
      />

      {/* Logo top center */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          zIndex: 2,
        }}
      >
        <img
          src="/VoucherUmroh/logo.png"
          alt="Logo"
          style={{ width: "70px", height: "70px", objectFit: "contain" }}
        />

        <div
          style={{
            fontSize: "9px",
            letterSpacing: "2px",
            color: "rgba(201,168,76,0.7)",
            fontWeight: 500,
          }}
        >
          VOUCHER UMROH
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: "36px",
          right: "248px",
          bottom: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              color: "rgba(201,168,76,0.5)",
              marginBottom: "4px",
            }}
          >
            KARTU DISKON RESMI
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "26px",
              fontWeight: 700,
              color: "#f9f3e3",
              letterSpacing: "2px",
            }}
          >
            UMRAH VOUCHER
          </div>
        </div>

        {/* Fields */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}
        >
          {[
            { label: "Kode Voucher", value: voucher.kode_unik, mono: true },
            {
              label: "Nama Jemaah",
              value: voucher.nama_jemaah || "—",
              mono: false,
            },
            {
              label: "Kota Domisili",
              value: voucher.kota_domisili || "—",
              mono: false,
            },
            {
              label: "Travel Tujuan",
              value: voucher.travel_tujuan || "—",
              mono: false,
            },
            { label: "Rencana Berangkat", value: rencanaFmt, mono: false },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                padding: "6px 0",
                borderBottom: "1px solid rgba(201,168,76,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  color: "rgba(249,243,227,0.35)",
                  minWidth: "110px",
                  flexShrink: 0,
                  textTransform: "uppercase",
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  fontSize: f.mono ? "11px" : "13px",
                  fontWeight: 500,
                  color: f.mono ? "#e8c96d" : "#f9f3e3",
                  fontFamily: f.mono ? "'DM Mono',monospace" : "inherit",
                  letterSpacing: f.mono ? "1px" : "normal",
                  wordBreak: "break-all",
                }}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row: QR + Amount */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          {/* QR Code wrap */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              ref={qrRef}
              style={{
                width: "72px",
                height: "72px",
                background: "#fff",
                borderRadius: "6px",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: "8px",
                letterSpacing: "1px",
                color: "rgba(249,243,227,0.3)",
              }}
            >
              SCAN ME
            </div>
          </div>

          {/* Discount amount */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "8px",
                letterSpacing: "2px",
                color: "rgba(249,243,227,0.35)",
                marginBottom: "4px",
              }}
            >
              NILAI DISKON
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "22px",
                fontWeight: 700,
                background:
                  "linear-gradient(90deg,#c9a84c,#f5e09a,#e8c96d,#c9a84c)",
                backgroundSize: "250% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Rp 500.000
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "rgba(249,243,227,0.3)",
                marginTop: "2px",
              }}
            >
              berlaku di semua travel umroh
            </div>
          </div>
        </div>
      </div>

      {/* Status stamp */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "248px",
          fontSize: "8px",
          letterSpacing: "2px",
          color: "rgba(34,197,94,0.6)",
          fontWeight: 700,
          border: "1px solid rgba(34,197,94,0.2)",
          padding: "3px 10px",
          borderRadius: "50px",
          background: "rgba(34,197,94,0.05)",
        }}
      >
        ✓ AKTIF · SIAP DIGUNAKAN
      </div>
    </div>
  );
}

// ── Fallback jika QR library gagal load ──────────────────────
function renderFallback(el: HTMLDivElement, kode: string) {
  el.innerHTML = `
    <div style="width:72px;height:72px;background:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;padding:4px;">
      <div style="font-size:6px;text-align:center;color:#030f08;font-family:monospace;line-height:1.4;word-break:break-all;">${kode}</div>
    </div>
  `;
}
