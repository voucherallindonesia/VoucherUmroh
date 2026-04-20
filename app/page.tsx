// VoucherUmroh/app/page.tsx
"use client";
import { useState } from "react";
import styles from "./page.module.css";

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || "6285167060863"}`;
const BUY_URL = process.env.NEXT_PUBLIC_PAYMENT_URL || "https://lynk.id";

const BENEFITS = [
  {
    icon: "🕌",
    title: "Berlaku di Semua Travel",
    desc: "Tidak terikat satu travel tertentu. Berlaku di seluruh travel umroh resmi di Indonesia — kamu bebas memilih.",
  },
  {
    icon: "📅",
    title: "Waktu Redeem Fleksibel",
    desc: "Gunakan voucher sesuai jadwal keberangkatanmu. Tidak ada tekanan tenggat waktu.",
  },
  {
    icon: "♾️",
    title: "Tidak Ada Batas Waktu",
    desc: "Beli sekarang, simpan kapanpun. Voucher ini tidak akan pernah kedaluwarsa.",
  },
  {
    icon: "🤝",
    title: "Bebas Dialihkan Tanpa Syarat",
    desc: "Voucher yang dibeli bukan hanya bisa untuk diri sendiri, tapi juga untuk orang lain dan dapat dipindah tangankan.",
  },
  {
    icon: "🔍",
    title: "Transparan Sejak Awal",
    desc: "Kami menyampaikan dengan jelas bahwa voucher ini bukan paket umroh, bukan tabungan, dan tidak menjanjikan keberangkatan. Tidak ada informasi yang disembunyikan.",
  },
  {
    icon: "⚙️",
    title: "Sistem Sederhana & Mudah Dipahami",
    desc: "Tidak ada skema rumit. Hanya 4 langkah: beli, simpan, klaim, gunakan.",
  },
  {
    icon: "💚",
    title: "Dibuat untuk Menjaga Niat, Bukan Menjual Janji",
    desc: "Kami tidak menjual mimpi instan. Kami membantu Anda menjaga niat umroh dengan cara yang lebih realistis.",
  },
];

const PROBLEMS = [
  {
    num: "01",
    title: "Belum Siap Biaya Sekarang",
    masalah: "Banyak orang ingin umroh, tapi belum punya dana penuh saat ini.",
    solusi:
      "Voucher membantu Anda memiliki nilai potongan lebih dulu, tanpa harus langsung membayar paket umroh.",
  },
  {
    num: "02",
    title: "Takut Salah Pilih Travel",
    masalah:
      "Banyak kasus travel bermasalah membuat orang ragu untuk mengambil keputusan.",
    solusi:
      "Anda tidak perlu buru-buru memilih travel. Voucher bisa digunakan saat Anda sudah yakin dan siap.",
  },
  {
    num: "03",
    title: "Tidak Siap Waktu",
    masalah:
      "Pekerjaan, keluarga, dan kondisi hidup membuat sulit menentukan waktu berangkat.",
    solusi:
      "Voucher tidak memiliki batas waktu. Anda bisa menggunakannya kapan saja saat sudah siap.",
  },
  {
    num: "04",
    title: "Takut Komitmen Besar Sekaligus",
    masalah:
      "Langsung bayar puluhan juta terasa berat dan berisiko bagi sebagian orang.",
    solusi:
      "Voucher memungkinkan Anda mulai dari langkah kecil, tanpa tekanan untuk langsung mengambil paket.",
  },
  {
    num: "05",
    title: "Niat Sering Tertunda",
    masalah: "Niat umroh sering kalah oleh prioritas lain.",
    solusi: "Voucher menjadi pengingat & pegangan, agar niat tetap terjaga.",
  },
  {
    num: "06",
    title: "Bingung Mulai dari Mana",
    masalah: "Banyak orang tidak tahu harus mulai dari mana untuk umroh.",
    solusi:
      "Voucher bisa menjadi langkah awal sederhana, sebelum masuk ke proses yang lebih besar.",
  },
  {
    num: "07",
    title: "Takut Sistem yang Tidak Transparan",
    masalah:
      "Banyak orang khawatir dengan sistem yang tidak jelas atau terlalu rumit.",
    solusi:
      "Sistem voucher dibuat sederhana: beli → simpan → klaim → potong biaya.",
  },
];

const STEPS = [
  {
    n: "1",
    icon: "🛒",
    title: "Beli Voucher",
    desc: "Lakukan pembayaran Rp 60.000 melalui link.id dengan aman.",
  },
  {
    n: "2",
    icon: "📨",
    title: "Dapat Order ID",
    desc: "Terima Order ID dan link registrasi setelah pembayaran sukses.",
  },
  {
    n: "3",
    icon: "📝",
    title: "Isi Data Jemaah",
    desc: "Daftarkan data jemaah melalui form registrasi di website kami.",
  },
  {
    n: "4",
    icon: "🎴",
    title: "Voucher Aktif!",
    desc: "Tim kami memverifikasi dan kartu digital vouchermu siap — download kapanpun via tracking.",
  },
];

const TESTIMONIALS = [
  {
    init: "BH",
    name: "Budi Hartono",
    city: "Surabaya, Jawa Timur",
    text: "Awalnya ragu, tapi vouchernya beneran berlaku di travel yang saya pilih. Hemat Rp 500 ribu lumayan banget buat biaya living cost di sana.",
  },
  {
    init: "SR",
    name: "Siti Rahayu",
    city: "Makassar, Sulawesi Selatan",
    text: "Saya beli 3 voucher sekaligus untuk saya, suami, dan ibu mertua. Prosesnya gampang dan kartunya cantik! Tidak ada expired-nya.",
  },
  {
    init: "AN",
    name: "Ahmad Nasir",
    city: "Bandung, Jawa Barat",
    text: "Tunjukkan vouchernya ke travel dan langsung dipotong Rp 500 ribu. Tidak ribet sama sekali. Recommended banget!",
  },
];

const FAQS = [
  {
    q: "Voucher ini berlaku di travel mana saja?",
    a: "Berlaku di seluruh travel umroh resmi yang terdaftar di Indonesia. Bebas pilih travel yang paling cocok.",
  },
  {
    q: "Apakah voucher ini bisa kedaluwarsa?",
    a: "Tidak. Tidak ada batas waktu. Kamu bisa membeli sekarang dan menyimpannya hingga siap berangkat.",
  },
  {
    q: "Bisakah satu pembelian untuk beberapa jemaah?",
    a: "Bisa! Dalam satu Order ID, kamu bisa mendaftarkan beberapa jemaah sekaligus termasuk keluarga.",
  },
  {
    q: "Bagaimana cara menggunakan voucher di travel?",
    a: "Tunjukkan kartu digital vouchermu saat pendaftaran. Travel akan langsung memotong Rp 500.000.",
  },
  {
    q: "Berapa lama proses aktivasi setelah pembayaran?",
    a: "Setelah isi form registrasi, tim kami verifikasi dalam 1×24 jam di hari kerja dan menghubungimu via WhatsApp.",
  },
  {
    q: "Apakah data jemaah bisa diubah setelah diisi?",
    a: "Perubahan data hanya oleh admin. Hubungi tim kami melalui WhatsApp dan kami bantu dengan senang hati.",
  },
  {
    q: "Bisakah voucher ini diberikan ke orang lain?",
    a: "Bisa! Voucher bebas dialihkan tanpa syarat. Bisa untuk keluarga, teman, atau siapa saja yang ingin umroh.",
  },
];

const PRICE_FEATURES = [
  "Berlaku disemua travel",
  "Waktu redeem fleksibel",
  "Tidak ada batas waktu",
  "Bebas dialihkan tanpa syarat",
  "Kartu voucher digital eksklusif",
  "Bebas untuk beberapa jamaah dalam satu pembelian",
  "Support via WhatsApp langsung dari tim kami",
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <div className="pattern-bg" />

      {/* ══ HERO ══ */}
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          padding: "120px 6% 80px",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "-200px",
            width: "700px",
            height: "700px",
            background:
              "radial-gradient(circle,rgba(26,107,56,0.18) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <div
              className="fade-up d1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: "50px",
                padding: "6px 16px",
                fontSize: "12px",
                color: "#e8c96d",
                letterSpacing: "1px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#c9a84c",
                  borderRadius: "50%",
                  animation: "glow 2s ease infinite",
                }}
              />
              Voucher Resmi Umroh Indonesia
            </div>

            {/* ── UPDATED HEADLINE ── */}
            <h1
              className="fade-up d2 serif"
              style={{
                fontSize: "clamp(36px,5vw,62px)",
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: "20px",
              }}
            >
              Pegang Niat Umroh <span className="shimmer">Hari Ini</span>
              <br />
              <span
                style={{
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "rgba(249,243,227,0.6)",
                }}
              >
                Berangkat saat siap
              </span>
            </h1>

            {/* ── UPDATED SUBTEXT ── */}
            <p
              className="fade-up d3"
              style={{
                fontSize: "17px",
                color: "var(--cream-dim)",
                lineHeight: 1.75,
                marginBottom: "36px",
                maxWidth: "480px",
              }}
            >
              Voucher Umroh Indonesia adalah voucher digital yang digunakan
              sebagai potongan biaya saat klaim ke travel mitra.{" "}
              <span style={{ color: "rgba(249,243,227,0.75)" }}>
                Bukan paket umroh, bukan tabungan, dan tidak menjanjikan
                keberangkatan.
              </span>{" "}
              Dapat berpindah tangan ke orang lain.
            </p>

            <div className={`fade-up d4 ${styles.heroButtons}`}>
              <a
                href={BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                🛒 Beli Voucher — Rp 60.000
              </a>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                💬 Konsultasi via WhatsApp
              </a>
            </div>

            {/* ── UPDATED CHECKMARKS (4 items) ── */}
            <div className={`fade-up d5 ${styles.heroChecks}`}>
              {[
                "Berlaku semua travel",
                "Tidak ada expired",
                "Jadwal fleksibel",
                "Bebas dialihkan tanpa syarat",
              ].map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "13px",
                    color: "rgba(249,243,227,0.5)",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.4)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      color: "#22c55e",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Voucher Card */}
          <div className={styles.heroCardContainer}>
            <div
              className={styles.heroRing}
              style={{
                position: "absolute",
                width: "440px",
                height: "440px",
                borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.08)",
                animation: "rotateSlow 20s linear infinite",
              }}
            />
            <div
              className={styles.heroRing}
              style={{
                position: "absolute",
                width: "380px",
                height: "380px",
                borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.05)",
                animation: "rotateSlow 28s linear reverse infinite",
              }}
            />
            <div
              className={styles.heroCard}
              style={{
                background: "linear-gradient(145deg,#0d4a24,#1a7a3e,#0b3b1c)",
                border: "1px solid rgba(201,168,76,0.4)",
                borderRadius: "24px",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
                animation:
                  "float 5s ease-in-out infinite, pulseRing 4s ease-in-out infinite",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "28px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "linear-gradient(135deg,#c9a84c,#e8c96d)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                      width: "22px",
                      height: "22px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#e8c96d",
                  }}
                >
                  Voucher Umroh
                </span>
                <div
                  style={{
                    width: "40px",
                    height: "28px",
                    background: "rgba(201,168,76,0.15)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: "5px",
                    marginLeft: "auto",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  color: "rgba(249,243,227,0.4)",
                  marginBottom: "6px",
                }}
              >
                NILAI DISKON
              </div>
              <div
                className="shimmer serif"
                style={{
                  fontSize: "38px",
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                Rp 500.000
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(249,243,227,0.4)",
                  marginBottom: "28px",
                }}
              >
                untuk biaya perjalanan umroh
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px dashed rgba(201,168,76,0.25)",
                  marginBottom: "24px",
                }}
              />
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "rgba(249,243,227,0.35)",
                  marginBottom: "6px",
                }}
              >
                KODE VOUCHER
              </div>
              <div
                className="mono"
                style={{
                  fontSize: "18px",
                  letterSpacing: "6px",
                  color: "#e8c96d",
                  fontWeight: 500,
                  marginBottom: "20px",
                }}
              >
                ID•XXXX•XXXX
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  "✓ Semua Travel",
                  "✓ No Expired",
                  "✓ Fleksibel",
                  "✓ Bisa Dialihkan",
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "10px",
                      padding: "4px 10px",
                      borderRadius: "50px",
                      background: "rgba(201,168,76,0.1)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "rgba(249,243,227,0.55)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div
        style={{
          padding: "28px 6%",
          background: "rgba(13,61,30,0.4)",
          borderTop: "1px solid rgba(201,168,76,0.08)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: "60px",
            flexWrap: "wrap",
          }}
        >
          {[
            ["500+", "Jamaah Terbantu"],
            ["200+", "Travel Partner"],
            ["34", "Provinsi di Indonesia"],
            ["100%", "Kepuasan Jamaah"],
          ].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                className="shimmer serif"
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {n}
              </div>
              <div
                style={{ fontSize: "13px", color: "rgba(249,243,227,0.45)" }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PROBLEM & SOLUTION (REDESIGNED) ══ */}
      <section
        id="problem"
        style={{
          padding: "100px 6%",
          background: "rgba(5,18,10,0.6)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* ── UPDATED TITLE & SUBTITLE ── */}
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="label-tag">Tantangan & Solusi</div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(28px,4vw,46px)",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Kenapa Banyak Orang{" "}
              <span className="shimmer">Menunda Umroh?</span>
            </h2>
            <p
              style={{
                fontSize: "17px",
                color: "var(--cream-dim)",
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Bukan karena tidak ingin.
              <br />
              Tapi karena ada beberapa tantangan yang sering dihadapi.
            </p>
          </div>

          {/* ── 7 PROBLEM-SOLUTION CARDS ── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              justifyContent: "center",
            }}
          >
            {PROBLEMS.map((p) => (
              <div
                key={p.num}
                style={{
                  flex: "0 0 300px",
                  maxWidth: "300px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  overflow: "hidden",
                  transition: "all 0.35s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.borderColor = "rgba(201,168,76,0.25)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "";
                  el.style.borderColor = "rgba(201,168,76,0.1)";
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    padding: "20px 28px 16px",
                    borderBottom: "1px solid rgba(201,168,76,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <span
                    className="serif"
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "rgba(201,168,76,0.2)",
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {p.num}
                  </span>
                  <h3
                    className="serif"
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "#e8c96d",
                      lineHeight: 1.3,
                    }}
                  >
                    {p.title}
                  </h3>
                </div>

                {/* Card Body */}
                <div style={{ padding: "20px 28px 28px" }}>
                  {/* Masalah */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "10px",
                        letterSpacing: "1.5px",
                        color: "rgba(255,130,130,0.75)",
                        marginBottom: "8px",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "rgba(255,100,100,0.4)",
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                      MASALAH
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "rgba(249,243,227,0.5)",
                        lineHeight: 1.65,
                      }}
                    >
                      {p.masalah}
                    </p>
                  </div>

                  {/* Solusi */}
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "10px",
                        letterSpacing: "1.5px",
                        color: "rgba(34,197,94,0.8)",
                        marginBottom: "8px",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "rgba(34,197,94,0.35)",
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                      SOLUSI
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "rgba(249,243,227,0.65)",
                        lineHeight: 1.65,
                      }}
                    >
                      {p.solusi}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── SECTION FOOTER ── */}
          <div
            style={{
              textAlign: "center",
              marginTop: "64px",
              padding: "36px 40px",
              borderRadius: "20px",
              background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.1)",
              maxWidth: "640px",
              margin: "64px auto 0",
            }}
          >
            <p
              className="serif"
              style={{
                fontSize: "18px",
                color: "rgba(249,243,227,0.7)",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              Voucher Umroh Indonesia bukan solusi untuk semua orang.
              <br />
              Tapi bagi Anda yang belum siap sekarang,
              <br />
              <span style={{ color: "#e8c96d" }}>
                ini bisa menjadi langkah awal yang lebih tenang.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ══ KEUNGGULAN (UPDATED: 7 cards + new subtitle + footer) ══ */}
      <section id="keunggulan" style={{ padding: "100px 6%" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="label-tag">Keunggulan Kami</div>
            {/* ── UPDATED TITLE ── */}
            <h2
              className="serif"
              style={{
                fontSize: "clamp(28px,4vw,46px)",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Kenapa Voucher Umroh Indonesia{" "}
              <span className="shimmer">Berbeda?</span>
            </h2>
            {/* ── NEW SUBTITLE ── */}
            <p
              style={{
                fontSize: "17px",
                color: "var(--cream-dim)",
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Kami tidak mencoba menjadi yang paling cepat.
              <br />
              Kami fokus menjadi yang paling jelas dan masuk akal.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              justifyContent: "center",
            }}
          >
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                style={{
                  flex: "0 0 260px",
                  maxWidth: "260px",
                  padding: "36px 28px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  transition: "all 0.35s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-6px)";
                  el.style.borderColor = "rgba(201,168,76,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "";
                  el.style.borderColor = "rgba(201,168,76,0.12)";
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "20px",
                  }}
                >
                  {b.icon}
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: "19px",
                    fontWeight: 600,
                    color: "#e8c96d",
                    marginBottom: "10px",
                  }}
                >
                  {b.title}
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(249,243,227,0.5)",
                    lineHeight: 1.75,
                  }}
                >
                  {b.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ── SECTION FOOTER ── */}
          <div
            style={{
              textAlign: "center",
              marginTop: "64px",
              padding: "28px",
              borderTop: "1px solid rgba(201,168,76,0.1)",
            }}
          >
            <p
              className="serif"
              style={{
                fontSize: "18px",
                color: "rgba(249,243,227,0.55)",
                fontStyle: "italic",
                lineHeight: 1.8,
              }}
            >
              Kami percaya, kepercayaan tidak dibangun dari janji besar,
              <br />
              <span style={{ color: "#e8c96d" }}>
                tapi dari kejelasan dan konsistensi.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ══ TRANSPARANSI (NEW SECTION) ══ */}
      <section
        id="transparansi"
        style={{
          padding: "100px 6%",
          background: "rgba(5,18,10,0.7)",
          position: "relative",
        }}
      >
        <div
          style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}
        >
          <div className="label-tag">Anti Penipuan</div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(28px,4vw,46px)",
              fontWeight: 700,
              marginBottom: "48px",
            }}
          >
            <span className="shimmer">Transparansi Kami</span>
          </h2>

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "24px",
              padding: "48px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* top accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background:
                  "linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)",
              }}
            />

            {/* Shield icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                margin: "0 auto 32px",
              }}
            >
              🛡️
            </div>

            <div style={{ textAlign: "left" }}>
              {[
                "Voucher ini bukan paket umroh",
                "Kami bukan travel penyelenggara umroh",
                "Tidak ada janji keberangkatan",
                "Tidak ada sistem investasi atau imbal hasil",
                "Tidak ada dana berputar antar pengguna",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    padding: "16px 0",
                    borderBottom: "1px solid rgba(201,168,76,0.07)",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      color: "#22c55e",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    ✓
                  </div>
                  <span
                    style={{
                      fontSize: "16px",
                      color: "rgba(249,243,227,0.75)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SIMULASI NYATA (NEW SECTION) ══ */}
      <section
        id="simulasi"
        style={{
          padding: "100px 6%",
          background: "rgba(7,26,15,0.5)",
          position: "relative",
        }}
      >
        <div
          style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}
        >
          <div className="label-tag">Contoh Penggunaan</div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(28px,4vw,46px)",
              fontWeight: 700,
              marginBottom: "48px",
            }}
          >
            Contoh Penggunaan <span className="shimmer">Voucher</span>
          </h2>

          <div
            style={{
              background:
                "linear-gradient(145deg,rgba(13,61,30,0.8),rgba(7,26,15,0.9))",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "24px",
              padding: "44px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(90deg,#c9a84c,#e8c96d,#c9a84c)",
              }}
            />

            {/* Simulation rows */}
            {[
              {
                label: "Harga paket umroh",
                value: "Rp 30.000.000",
                color: "var(--cream)",
                isTotal: false,
              },
              {
                label: "Voucher Anda",
                value: "– Rp 500.000",
                color: "#22c55e",
                isTotal: false,
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(201,168,76,0.08)",
                }}
              >
                <span
                  style={{ fontSize: "16px", color: "rgba(249,243,227,0.6)" }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: row.color,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 0 8px",
              }}
            >
              <span
                className="serif"
                style={{ fontSize: "18px", fontWeight: 700, color: "#e8c96d" }}
              >
                Yang Dibayarkan
              </span>
              <span
                className="shimmer serif"
                style={{ fontSize: "28px", fontWeight: 700 }}
              >
                Rp 29.500.000
              </span>
            </div>

            {/* Note */}
            <div
              style={{
                marginTop: "24px",
                padding: "16px 20px",
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: "12px",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(249,243,227,0.5)",
                  lineHeight: 1.65,
                }}
              >
                <span style={{ color: "#c9a84c" }}>*Catatan:</span> Voucher
                tidak mengurangi harga DP paket, tapi harga keseluruhan dari
                paket yang dipilih.
              </p>
            </div>
          </div>

          <p
            className="serif"
            style={{
              marginTop: "32px",
              fontSize: "17px",
              color: "rgba(249,243,227,0.5)",
              fontStyle: "italic",
            }}
          >
            Sederhana, transparan, dan mudah dipahami.
          </p>
        </div>
      </section>

      {/* ══ CARA KERJA ══ */}
      <section
        id="cara-kerja"
        style={{
          padding: "100px 6%",
          background: "rgba(7,26,15,0.5)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="label-tag">Prosesnya Mudah</div>
            <h2
              className="serif"
              style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 700 }}
            >
              Cara Mendapatkan
              <br />
              <span className="shimmer">Voucher Umrohmu</span>
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "16px",
            }}
            className="steps-grid"
          >
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(13,61,30,0.9)",
                    border: "1.5px solid rgba(201,168,76,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#c9a84c",
                    marginBottom: "16px",
                    transition: "all 0.3s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = "#c9a84c";
                    el.style.color = "#030f08";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = "rgba(13,61,30,0.9)";
                    el.style.color = "#c9a84c";
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: "20px", marginBottom: "12px" }}>
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--cream)",
                    marginBottom: "6px",
                    lineHeight: 1.3,
                  }}
                >
                  {s.title}
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(249,243,227,0.45)",
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HARGA (UPDATED: 60k + marketing gimmick + 7 features) ══ */}
      <section id="harga" style={{ padding: "100px 6%", textAlign: "center" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="label-tag">Penawaran Terbatas</div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(28px,4vw,46px)",
              fontWeight: 700,
              marginBottom: "48px",
            }}
          >
            Satu Harga,
            <br />
            <span className="shimmer">Manfaat Berlipat</span>
          </h2>

          <div
            style={{
              maxWidth: "460px",
              margin: "0 auto",
              background:
                "linear-gradient(145deg,rgba(13,61,30,0.8),rgba(7,26,15,0.9))",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "28px",
              padding: "48px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(90deg,#c9a84c,#e8c96d,#c9a84c)",
              }}
            />

            {/* ── MARKETING GIMMICK BADGE ── */}
            <div
              style={{
                display: "inline-block",
                background: "rgba(255,100,100,0.12)",
                border: "1px solid rgba(255,100,100,0.3)",
                color: "#ff8080",
                fontSize: "12px",
                padding: "4px 14px",
                borderRadius: "50px",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              🔥 PENAWARAN HARI INI
            </div>

            {/* ── STRIKETHROUGH ORIGINAL PRICE ── */}
            <div
              style={{
                fontSize: "18px",
                color: "rgba(249,243,227,0.3)",
                textDecoration: "line-through",
                marginBottom: "4px",
              }}
            >
              Rp 99.000
            </div>

            {/* ── NEW PRICE ── */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#c9a84c",
                  marginTop: "8px",
                }}
              >
                Rp
              </span>
              <span
                className="shimmer serif"
                style={{ fontSize: "68px", fontWeight: 700, lineHeight: 1 }}
              >
                60
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#c9a84c",
                  marginTop: "8px",
                }}
              >
                .000
              </span>
            </div>

            {/* ── SAVINGS CALLOUT ── */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "#22c55e",
                fontSize: "13px",
                padding: "4px 14px",
                borderRadius: "50px",
                marginBottom: "8px",
              }}
            >
              ✦ Hemat Rp 39.000 dari harga normal
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "rgba(249,243,227,0.35)",
                marginBottom: "32px",
              }}
            >
              harga per voucher · satu kali bayar
            </p>

            <div
              style={{
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: "14px",
                padding: "18px 24px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(249,243,227,0.4)",
                  letterSpacing: "1px",
                  marginBottom: "6px",
                }}
              >
                NILAI DISKON YANG KAMU DAPATKAN
              </div>
              <div
                className="shimmer serif"
                style={{ fontSize: "28px", fontWeight: 700 }}
              >
                Rp 500.000
              </div>
            </div>

            {/* ── 7 FEATURES ── */}
            <div style={{ textAlign: "left", marginBottom: "32px" }}>
              {PRICE_FEATURES.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "rgba(249,243,227,0.65)",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      color: "#22c55e",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <a
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
              style={{ width: "100%", fontSize: "16px", padding: "16px" }}
            >
              🛒 Beli Voucher Sekarang
            </a>

            {/* Urgency footnote */}
            <p
              style={{
                marginTop: "14px",
                fontSize: "12px",
                color: "rgba(249,243,227,0.3)",
              }}
            >
              * Harga spesial berlaku hari ini saja
            </p>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONI ══ */}
      <section
        id="testimoni"
        style={{ padding: "100px 6%", background: "rgba(3,12,6,0.7)" }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="label-tag">Mereka Sudah Merasakan</div>
            <h2
              className="serif"
              style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 700 }}
            >
              Cerita dari
              <br />
              <span className="shimmer">Jamaah Kami</span>
            </h2>
          </div>
          <div className={`testi-grid ${styles.testiGrid}`}>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: "28px",
                  borderRadius: "18px",
                  background: "rgba(7,26,15,0.6)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.borderColor = "rgba(201,168,76,0.2)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "";
                  el.style.borderColor = "rgba(201,168,76,0.1)";
                }}
              >
                <div
                  style={{
                    color: "#c9a84c",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    marginBottom: "14px",
                  }}
                >
                  ★★★★★
                </div>
                <p
                  style={{
                    fontSize: "15px",
                    color: "rgba(249,243,227,0.65)",
                    lineHeight: 1.8,
                    fontStyle: "italic",
                    marginBottom: "20px",
                  }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="divider" style={{ marginBottom: "16px" }} />
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#1a6b38,#0d3d1e)",
                      border: "1.5px solid rgba(201,168,76,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Playfair Display',serif",
                      fontWeight: 700,
                      fontSize: "15px",
                      color: "#e8c96d",
                      flexShrink: 0,
                    }}
                  >
                    {t.init}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "var(--cream)",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#c9a84c",
                        marginTop: "2px",
                      }}
                    >
                      📍 {t.city}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section
        id="faq"
        style={{ padding: "100px 6%", background: "rgba(5,18,10,0.5)" }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="label-tag">FAQ</div>
            <h2
              className="serif"
              style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 700 }}
            >
              Pertanyaan yang
              <br />
              <span className="shimmer">Sering Ditanyakan</span>
            </h2>
          </div>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            {FAQS.map((f, i) => (
              <div
                key={i}
                style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    color: "var(--cream)",
                    fontFamily: "'Tajawal',sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    padding: "20px 0",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#e8c96d")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--cream)")
                  }
                >
                  {f.q}
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "1px solid rgba(201,168,76,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      color: "#c9a84c",
                      flexShrink: 0,
                      transition: "all 0.3s",
                      transform: openFaq === i ? "rotate(45deg)" : "none",
                      background:
                        openFaq === i ? "rgba(201,168,76,0.1)" : "transparent",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: openFaq === i ? "300px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      padding: "0 0 20px",
                      fontSize: "15px",
                      color: "rgba(249,243,227,0.55)",
                      lineHeight: 1.8,
                    }}
                  >
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section
        style={{
          padding: "100px 6%",
          textAlign: "center",
          background:
            "radial-gradient(ellipse at center,rgba(26,107,56,0.15) 0%,transparent 60%)",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: "70px", height: "70px", objectFit: "contain" }}
          />
        </div>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(32px,5vw,56px)",
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: "20px",
          }}
        >
          Mulai Perjalanan Ibadah
          <br />
          <span className="shimmer">Lebih Hemat Hari Ini</span>
        </h2>
        <p
          style={{
            fontSize: "17px",
            color: "var(--cream-dim)",
            maxWidth: "520px",
            margin: "0 auto 48px",
            lineHeight: 1.75,
          }}
        >
          Bergabunglah bersama ratusan jamaah yang telah merasakan manfaatnya.
          Hemat Rp 500.000 menunggumu.
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href={BUY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold"
            style={{ fontSize: "17px", padding: "17px 42px" }}
          >
            🛒 Beli Voucher — Rp 60.000
          </a>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ fontSize: "17px", padding: "16px 42px" }}
          >
            💬 Tanya via WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
