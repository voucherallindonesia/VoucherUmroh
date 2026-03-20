"use client";
import Link from "next/link";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "6285167060863";

export default function Footer() {
  return (
    <footer
      style={{
        background: "rgba(2,8,4,0.95)",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "56px 6% 32px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "48px",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <img
                src="/VoucherUmroh/public/logo.png"
                alt="Logo"
                style={{ width: "50px", height: "50px", objectFit: "contain" }}
              />

              <span
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontWeight: 700,
                  fontSize: "17px",
                  color: "#e8c96d",
                }}
              >
                Voucher Umroh
              </span>
            </Link>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(249,243,227,0.35)",
                lineHeight: 1.8,
                marginTop: "14px",
                maxWidth: "240px",
              }}
            >
              Solusi hemat perjalanan ibadah umroh untuk seluruh umat muslim di
              Indonesia.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "2.5px",
                color: "#c9a84c",
                marginBottom: "18px",
                fontWeight: 500,
              }}
            >
              NAVIGASI
            </div>
            {[
              { label: "Keunggulan", href: "/#keunggulan" },
              { label: "Cara Kerja", href: "/#cara-kerja" },
              { label: "Harga", href: "/#harga" },
              { label: "FAQ", href: "/#faq" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "rgba(249,243,227,0.4)",
                  textDecoration: "none",
                  marginBottom: "10px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e8c96d")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(249,243,227,0.4)")
                }
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Layanan */}
          <div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "2.5px",
                color: "#c9a84c",
                marginBottom: "18px",
                fontWeight: 500,
              }}
            >
              LAYANAN
            </div>
            {[
              { label: "Registrasi Jemaah", href: "/register" },
              { label: "Cek Voucher", href: "/tracking" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "rgba(249,243,227,0.4)",
                  textDecoration: "none",
                  marginBottom: "10px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e8c96d")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(249,243,227,0.4)")
                }
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Kontak */}
          <div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "2.5px",
                color: "#c9a84c",
                marginBottom: "18px",
                fontWeight: 500,
              }}
            >
              KONTAK
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(249,243,227,0.4)",
                marginBottom: "8px",
              }}
            >
              📱 +62 851-6706-0863
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(249,243,227,0.4)",
                marginBottom: "8px",
              }}
            >
              ✉️ info@voucherumroh.id
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              {["IG", "YT", "TT"].map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: "12px",
                    padding: "6px 14px",
                    background: "rgba(201,168,76,0.07)",
                    border: "1px solid rgba(201,168,76,0.18)",
                    borderRadius: "50px",
                    color: "#c9a84c",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)",
            margin: "0 0 24px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "13px",
            color: "rgba(249,243,227,0.25)",
          }}
        >
          <span>© 2026 Voucher Umroh. Semua hak dilindungi.</span>
          <span>Dibuat dengan ❤️ untuk jamaah Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
