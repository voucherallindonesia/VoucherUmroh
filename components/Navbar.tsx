// components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Keunggulan", href: isHome ? "#keunggulan" : "/#keunggulan" },
    { label: "Cara Kerja", href: isHome ? "#cara-kerja" : "/#cara-kerja" },
    { label: "Harga", href: isHome ? "#harga" : "/#harga" },
    { label: "FAQ", href: isHome ? "#faq" : "/#faq" },
    { label: "Cek Voucher", href: "/tracking" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 6%",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(2,8,4,0.97)" : "rgba(3,15,8,0.88)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        transition: "background 0.3s ease",
      }}
    >
      {/* Logo */}
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
          src="/logo.png"
          alt="Logo"
          style={{ width: "40px", height: "40px", objectFit: "contain" }}
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

      {/* Desktop Links */}
      <ul
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          listStyle: "none",
        }}
        className="hidden md:flex"
      >
        {navLinks.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              style={{
                color: "rgba(249,243,227,0.6)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e8c96d")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(249,243,227,0.6)")
              }
            >
              {l.label}
            </Link>
          </li>
        ))}
        <li>
          <a
            href={process.env.NEXT_PUBLIC_PAYMENT_URL || "https://link.id"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "linear-gradient(135deg,#c9a84c,#e8c96d)",
              color: "#030f08",
              padding: "8px 22px",
              borderRadius: "50px",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(201,168,76,0.25)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(201,168,76,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(201,168,76,0.25)";
            }}
          >
            Beli Sekarang
          </a>
        </li>
      </ul>

      {/* Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
        aria-label="Menu"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "#e8c96d",
              borderRadius: "2px",
              transition: "all 0.3s",
            }}
          />
        ))}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "68px",
            left: 0,
            right: 0,
            background: "rgba(2,8,4,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
            padding: "20px 6%",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            zIndex: 99,
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "rgba(249,243,227,0.7)",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={process.env.NEXT_PUBLIC_PAYMENT_URL || "https://link.id"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "linear-gradient(135deg,#c9a84c,#e8c96d)",
              color: "#030f08",
              padding: "12px 24px",
              borderRadius: "50px",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            🛒 Beli Sekarang
          </a>
        </div>
      )}
    </nav>
  );
}
