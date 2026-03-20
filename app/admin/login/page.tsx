"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkAdminPassword, setAdminSession } from "@/lib/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (checkAdminPassword(pw)) {
        setAdminSession();
        router.push("/admin/dashboard");
      } else {
        setError("Password salah. Coba lagi.");
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--green-deep)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Tajawal',sans-serif",
        position: "relative",
      }}
    >
      <div className="pattern-bg" />

      {/* Glow */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle,rgba(26,107,56,0.15) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img
            src="/VoucherUmroh/logo.png"
            alt="Logo"
            style={{ width: "45px", height: "45px", objectFit: "contain" }}
          />
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "22px",
              fontWeight: 700,
              color: "#e8c96d",
            }}
          >
            Voucher Umroh
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(249,243,227,0.4)",
              marginTop: "4px",
              letterSpacing: "2px",
            }}
          >
            ADMIN PANEL
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: "24px",
            padding: "40px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg,transparent,#c9a84c,transparent)",
              borderRadius: "24px 24px 0 0",
            }}
          />

          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--cream)",
              marginBottom: "8px",
            }}
          >
            Selamat Datang
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(249,243,227,0.45)",
              marginBottom: "32px",
            }}
          >
            Masukkan password untuk mengakses dashboard admin.
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(249,243,227,0.6)",
                marginBottom: "8px",
              }}
            >
              Password Admin
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ fontSize: "16px", letterSpacing: "3px" }}
              autoFocus
            />
            {error && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "rgba(255,100,100,0.85)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ⚠ {error}
              </div>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !pw.trim()}
            className="btn-gold"
            style={{ width: "100%", fontSize: "15px", padding: "15px" }}
          >
            {loading ? "⏳ Memverifikasi..." : "🔐 Masuk ke Dashboard"}
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "12px",
            color: "rgba(249,243,227,0.2)",
          }}
        >
          Halaman ini hanya untuk admin Voucher Umroh
        </div>
      </div>
    </div>
  );
}
