"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  isAdminLoggedIn,
  clearAdminSession,
  getAllOrders,
  getVouchersByOrderId,
  getDashboardStats,
  activateOrder,
  rejectOrder,
  markVoucherUsed,
  addVoucher,
  deleteVoucher,
  resetVoucherData,
} from "@/lib/admin";
import type { Order, Voucher } from "@/types";

type TabType = "orders" | "vouchers";
type ToastState = { message: string; type: "success" | "error" | "info" };

// ── CONFIRM MODAL ─────────────────────────────────────────────
interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
}

const CONFIRM_CLOSED: ConfirmState = {
  open: false,
  title: "",
  message: "",
  confirmLabel: "",
  confirmColor: "#22c55e",
  onConfirm: () => {},
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpanded] = useState<string | null>(null);
  const [orderVouchers, setOV] = useState<Record<string, Voucher[]>>({});
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    totalVouchers: 0,
    activeVouchers: 0,
    usedVouchers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoad, setActLoad] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [filterStatus, setFilter] = useState("all");
  const [searchQ, setSearch] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace("/admin/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        getAllOrders(),
        getDashboardStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch {
      showToast("Gagal memuat data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── EXPAND ORDER ─────────────────────────────────────────────
  async function toggleExpand(orderId: string) {
    if (expandedOrder === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    if (!orderVouchers[orderId]) {
      try {
        const v = await getVouchersByOrderId(orderId);
        setOV((prev) => ({ ...prev, [orderId]: v }));
      } catch {
        showToast("Gagal memuat voucher.", "error");
      }
    }
  }

  async function refreshVouchers(orderId: string) {
    try {
      const v = await getVouchersByOrderId(orderId);
      setOV((prev) => ({ ...prev, [orderId]: v }));
    } catch {}
  }

  // ── CONFIRM HELPER ───────────────────────────────────────────
  function askConfirm(
    title: string,
    message: string,
    confirmLabel: string,
    confirmColor: string,
    onConfirm: () => void,
  ) {
    setConfirm({
      open: true,
      title,
      message,
      confirmLabel,
      confirmColor,
      onConfirm,
    });
  }

  // ── ORDER ACTIONS ────────────────────────────────────────────
  async function handleActivate(orderId: string) {
    setActLoad(orderId + "_activate");
    const r = await activateOrder(orderId);
    if (r.success) {
      showToast(`✓ Order ${orderId} diaktifkan!`, "success");
      await fetchData();
      await refreshVouchers(orderId);
    } else showToast("Gagal mengaktifkan.", "error");
    setActLoad(null);
  }

  async function handleReject(orderId: string) {
    askConfirm(
      "Tolak Order",
      `Yakin ingin menolak order ${orderId}? Semua voucher akan ditolak.`,
      "Tolak",
      "rgba(255,100,100,0.85)",
      async () => {
        setConfirm(CONFIRM_CLOSED);
        setActLoad(orderId + "_reject");
        const r = await rejectOrder(orderId);
        if (r.success) {
          showToast(`Order ${orderId} ditolak.`, "info");
          await fetchData();
        } else showToast("Gagal menolak.", "error");
        setActLoad(null);
      },
    );
  }

  // ── VOUCHER ACTIONS ───────────────────────────────────────────

  async function handleMarkUsed(kode: string, orderId: string) {
    askConfirm(
      "Tandai Terpakai",
      `Tandai voucher ${kode} sebagai sudah digunakan?`,
      "Tandai Terpakai",
      "#60a5fa",
      async () => {
        setConfirm(CONFIRM_CLOSED);
        setActLoad(kode + "_used");
        const r = await markVoucherUsed(kode);
        if (r.success) {
          showToast(`✓ Voucher ${kode} ditandai terpakai.`, "success");
          await fetchData();
          await refreshVouchers(orderId);
        } else showToast("Gagal.", "error");
        setActLoad(null);
      },
    );
  }

  async function handleAddVoucher(orderId: string) {
    setActLoad(orderId + "_add");
    const r = await addVoucher(orderId);
    if (r.success) {
      showToast(`✓ Slot voucher baru ditambahkan ke ${orderId}!`, "success");
      await fetchData();
      await refreshVouchers(orderId);
    } else showToast("Gagal menambah voucher.", "error");
    setActLoad(null);
  }

  async function handleDeleteVoucher(
    kode: string,
    orderId: string,
    namaJemaah: string,
  ) {
    askConfirm(
      "🗑 Hapus Voucher",
      `Voucher ${kode}${namaJemaah ? ` (${namaJemaah})` : ""} akan dihapus PERMANEN dari database. Data tidak bisa dikembalikan.`,
      "Hapus Permanen",
      "rgba(255,100,100,0.85)",
      async () => {
        setConfirm(CONFIRM_CLOSED);
        setActLoad(kode + "_delete");
        const r = await deleteVoucher(kode, orderId);
        if (r.success) {
          showToast(`Voucher ${kode} berhasil dihapus.`, "info");
          await fetchData();
          await refreshVouchers(orderId);
        } else showToast("Gagal menghapus.", "error");
        setActLoad(null);
      },
    );
  }

  async function handleResetData(
    kode: string,
    orderId: string,
    namaJemaah: string,
  ) {
    askConfirm(
      "↺ Reset Data Jemaah",
      `Data jemaah${namaJemaah ? ` "${namaJemaah}"` : ""} akan dikosongkan. Voucher tetap aktif dengan kode yang sama. Customer bisa isi ulang data via halaman registrasi.`,
      "Reset Data",
      "#eab308",
      async () => {
        setConfirm(CONFIRM_CLOSED);
        setActLoad(kode + "_reset");
        const r = await resetVoucherData(kode);
        if (r.success) {
          showToast(`✓ Data jemaah ${kode} berhasil direset.`, "success");
          await refreshVouchers(orderId);
        } else showToast("Gagal reset data.", "error");
        setActLoad(null);
      },
    );
  }

  // ── HELPERS ───────────────────────────────────────────────────
  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  function showToast(message: string, type: ToastState["type"]) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchSearch =
      !searchQ ||
      o.order_id.toLowerCase().includes(searchQ.toLowerCase()) ||
      o.nama_pembeli.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusColor = (s: string) =>
    ({
      pending: "#eab308",
      active: "#22c55e",
      rejected: "rgba(255,100,100,0.85)",
      completed: "#60a5fa",
    })[s] || "#888";
  const statusBg = (s: string) =>
    ({
      pending: "rgba(234,179,8,0.1)",
      active: "rgba(34,197,94,0.1)",
      rejected: "rgba(255,80,80,0.1)",
      completed: "rgba(96,165,250,0.1)",
    })[s] || "rgba(255,255,255,0.05)";
  const statusLabel = (s: string) =>
    ({
      pending: "⏳ Pending",
      active: "✓ Aktif",
      rejected: "✗ Ditolak",
      completed: "✓ Selesai",
    })[s] || s;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--green-deep)",
        fontFamily: "'Tajawal',sans-serif",
        color: "var(--cream)",
      }}
    >
      <div className="pattern-bg" />

      {/* ══ TOPBAR ══ */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(2,8,4,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
          padding: "0 6%",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/VoucherUmroh/public/logo.png"
            alt="Logo"
            style={{ width: "45px", height: "45px", objectFit: "contain" }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontWeight: 700,
                fontSize: "16px",
                color: "#e8c96d",
              }}
            >
              Voucher Umroh
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(249,243,227,0.35)",
                letterSpacing: "2px",
              }}
            >
              ADMIN PANEL
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={fetchData}
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "#e8c96d",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "'Tajawal',sans-serif",
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,80,80,0.08)",
              border: "1px solid rgba(255,100,100,0.2)",
              color: "rgba(255,130,130,0.85)",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "'Tajawal',sans-serif",
            }}
          >
            🚪 Keluar
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "32px 6%",
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ══ STATS ══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: "12px",
            marginBottom: "28px",
          }}
          className="stats-grid"
        >
          {[
            {
              label: "Total Order",
              value: stats.totalOrders,
              color: "#c9a84c",
              bg: "rgba(201,168,76,0.08)",
              border: "rgba(201,168,76,0.2)",
            },
            {
              label: "Perlu Verifikasi",
              value: stats.pendingOrders,
              color: "#eab308",
              bg: "rgba(234,179,8,0.08)",
              border: "rgba(234,179,8,0.2)",
              pulse: stats.pendingOrders > 0,
            },
            {
              label: "Order Aktif",
              value: stats.activeOrders,
              color: "#22c55e",
              bg: "rgba(34,197,94,0.08)",
              border: "rgba(34,197,94,0.2)",
            },
            {
              label: "Total Voucher",
              value: stats.totalVouchers,
              color: "#60a5fa",
              bg: "rgba(96,165,250,0.08)",
              border: "rgba(96,165,250,0.2)",
            },
            {
              label: "Voucher Aktif",
              value: stats.activeVouchers,
              color: "#22c55e",
              bg: "rgba(34,197,94,0.08)",
              border: "rgba(34,197,94,0.2)",
            },
            {
              label: "Sudah Dipakai",
              value: stats.usedVouchers,
              color: "rgba(249,243,227,0.4)",
              bg: "rgba(255,255,255,0.03)",
              border: "rgba(255,255,255,0.08)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                animation: (s as any).pulse
                  ? "pendingPulse 2s ease infinite"
                  : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {loading ? "—" : s.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(249,243,227,0.4)",
                  lineHeight: 1.3,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ══ ALERT PENDING ══ */}
        {stats.pendingOrders > 0 && !loading && (
          <div
            style={{
              background: "rgba(234,179,8,0.06)",
              border: "1px solid rgba(234,179,8,0.25)",
              borderRadius: "14px",
              padding: "14px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#eab308",
                animation: "glow 1.5s ease infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: "14px", color: "#eab308", fontWeight: 600 }}
            >
              Ada {stats.pendingOrders} order menunggu verifikasi!
            </span>
            <button
              onClick={() => {
                setFilter("pending");
                setTab("orders");
              }}
              style={{
                marginLeft: "auto",
                background: "rgba(234,179,8,0.15)",
                border: "1px solid rgba(234,179,8,0.3)",
                color: "#eab308",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "'Tajawal',sans-serif",
                fontWeight: 600,
              }}
            >
              Lihat →
            </button>
          </div>
        )}

        {/* ══ TABS ══ */}
        <div
          style={{
            display: "flex",
            gap: "0",
            marginBottom: "20px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.12)",
            borderRadius: "12px",
            padding: "4px",
            width: "fit-content",
          }}
        >
          {(["orders", "vouchers"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 24px",
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Tajawal',sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s",
                background:
                  tab === t
                    ? "linear-gradient(135deg,#c9a84c,#e8c96d)"
                    : "transparent",
                color: tab === t ? "#030f08" : "rgba(249,243,227,0.5)",
              }}
            >
              {t === "orders"
                ? `📋 Orders (${orders.length})`
                : "🎴 Semua Voucher"}
            </button>
          ))}
        </div>

        {/* ══ ORDERS TAB ══ */}
        {tab === "orders" && (
          <>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                className="form-input"
                placeholder="🔍 Cari Order ID atau nama..."
                value={searchQ}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  maxWidth: "280px",
                  padding: "10px 14px",
                  fontSize: "14px",
                }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                {["all", "pending", "active", "rejected"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "50px",
                      border: `1px solid ${filterStatus === s ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)"}`,
                      background:
                        filterStatus === s
                          ? "rgba(201,168,76,0.12)"
                          : "transparent",
                      color:
                        filterStatus === s
                          ? "#e8c96d"
                          : "rgba(249,243,227,0.4)",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "'Tajawal',sans-serif",
                      fontWeight: filterStatus === s ? 600 : 400,
                      transition: "all 0.2s",
                    }}
                  >
                    {s === "all" ? "Semua" : statusLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color: "rgba(249,243,227,0.3)",
                }}
              >
                ⏳ Memuat data...
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color: "rgba(249,243,227,0.3)",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📭</div>
                <div>Tidak ada order ditemukan</div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isExpanded={expandedOrder === order.order_id}
                    vouchers={orderVouchers[order.order_id] || []}
                    actionLoad={actionLoad}
                    onToggle={() => toggleExpand(order.order_id)}
                    onActivate={() => handleActivate(order.order_id)}
                    onReject={() => handleReject(order.order_id)}
                    onMarkUsed={(kode) => handleMarkUsed(kode, order.order_id)}
                    onAddVoucher={() => handleAddVoucher(order.order_id)}
                    onDeleteVoucher={(kode, nama) =>
                      handleDeleteVoucher(kode, order.order_id, nama)
                    }
                    onResetData={(kode, nama) =>
                      handleResetData(kode, order.order_id, nama)
                    }
                    statusColor={statusColor}
                    statusBg={statusBg}
                    statusLabel={statusLabel}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ VOUCHERS TAB ══ */}
        {tab === "vouchers" && (
          <VouchersTab
            statusColor={statusColor}
            statusBg={statusBg}
            statusLabel={statusLabel}
          />
        )}
      </div>

      {/* ══ CONFIRM MODAL ══ */}
      {confirm.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(7,26,15,0.97)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "20px",
              padding: "36px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--cream)",
                marginBottom: "12px",
              }}
            >
              {confirm.title}
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(249,243,227,0.55)",
                lineHeight: 1.75,
                marginBottom: "28px",
              }}
            >
              {confirm.message}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setConfirm(CONFIRM_CLOSED)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "rgba(249,243,227,0.6)",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "'Tajawal',sans-serif",
                  fontWeight: 600,
                }}
              >
                Batal
              </button>
              <button
                onClick={confirm.onConfirm}
                style={{
                  background:
                    confirm.confirmColor === "#22c55e"
                      ? "rgba(34,197,94,0.15)"
                      : confirm.confirmColor === "#eab308"
                        ? "rgba(234,179,8,0.15)"
                        : confirm.confirmColor === "#60a5fa"
                          ? "rgba(96,165,250,0.15)"
                          : "rgba(255,80,80,0.15)",
                  border: `1px solid ${confirm.confirmColor}44`,
                  color: confirm.confirmColor,
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Tajawal',sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 999,
            padding: "14px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "320px",
            backdropFilter: "blur(12px)",
            animation: "fadeUp 0.3s ease forwards",
            background:
              toast.type === "success"
                ? "rgba(13,61,30,0.95)"
                : toast.type === "error"
                  ? "rgba(60,10,10,0.95)"
                  : "rgba(20,40,70,0.95)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : toast.type === "error" ? "rgba(255,100,100,0.3)" : "rgba(100,150,255,0.3)"}`,
            color:
              toast.type === "success"
                ? "#22c55e"
                : toast.type === "error"
                  ? "rgba(255,130,130,0.9)"
                  : "rgba(150,180,255,0.9)",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ══ ORDER CARD ════════════════════════════════════════════════
function OrderCard({
  order,
  isExpanded,
  vouchers,
  actionLoad,
  onToggle,
  onActivate,
  onReject,
  onMarkUsed,
  onAddVoucher,
  onDeleteVoucher,
  onResetData,
  statusColor,
  statusBg,
  statusLabel,
}: {
  order: Order;
  isExpanded: boolean;
  vouchers: Voucher[];
  actionLoad: string | null;
  onToggle: () => void;
  onActivate: () => void;
  onReject: () => void;
  onMarkUsed: (k: string) => void;
  onAddVoucher: () => void;
  onDeleteVoucher: (k: string, n: string) => void;
  onResetData: (k: string, n: string) => void;
  statusColor: (s: string) => string;
  statusBg: (s: string) => string;
  statusLabel: (s: string) => string;
}) {
  const isPending = order.status === "pending";
  const createdFmt = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${isPending ? "rgba(234,179,8,0.25)" : "rgba(201,168,76,0.1)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.3s",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div
          onClick={onToggle}
          style={{
            flex: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: "200px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: statusBg(order.status),
              border: `1px solid ${statusColor(order.status)}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            {isPending ? "⏳" : order.status === "active" ? "✓" : "✗"}
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "3px",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#e8c96d",
                  letterSpacing: "1px",
                }}
              >
                {order.order_id}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "50px",
                  background: statusBg(order.status),
                  border: `1px solid ${statusColor(order.status)}44`,
                  color: statusColor(order.status),
                  fontWeight: 600,
                }}
              >
                {statusLabel(order.status)}
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "rgba(249,243,227,0.45)" }}>
              {order.nama_pembeli} · {order.no_whatsapp} ·
              <span style={{ color: "#e8c96d", fontWeight: 600 }}>
                {" "}
                {order.jumlah_voucher} voucher
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(249,243,227,0.3)" }}>
            {createdFmt}
          </span>

          {isPending && (
            <>
              <button
                onClick={onActivate}
                disabled={actionLoad === order.order_id + "_activate"}
                style={{
                  background: "linear-gradient(135deg,#1a5c2e,#22c55e)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "7px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Tajawal',sans-serif",
                  opacity: actionLoad ? 0.6 : 1,
                }}
              >
                {actionLoad === order.order_id + "_activate"
                  ? "⏳..."
                  : "✓ Aktifkan"}
              </button>
              <button
                onClick={onReject}
                disabled={!!actionLoad}
                style={{
                  background: "rgba(255,80,80,0.1)",
                  color: "rgba(255,130,130,0.85)",
                  border: "1px solid rgba(255,100,100,0.25)",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Tajawal',sans-serif",
                }}
              >
                ✗ Tolak
              </button>
            </>
          )}

          <a
            href={`https://wa.me/${order.no_whatsapp?.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(37,211,102,0.1)",
              color: "#25d366",
              border: "1px solid rgba(37,211,102,0.25)",
              borderRadius: "8px",
              padding: "7px 12px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            💬 WA
          </a>

          <button
            onClick={onToggle}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.15)",
              color: "rgba(249,243,227,0.5)",
              borderRadius: "8px",
              padding: "7px 10px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s",
              transform: isExpanded ? "rotate(180deg)" : "none",
            }}
          >
            ▾
          </button>
        </div>
      </div>

      {/* Expanded — Voucher List */}
      {isExpanded && (
        <div
          style={{
            borderTop: "1px solid rgba(201,168,76,0.08)",
            background: "rgba(0,0,0,0.2)",
            padding: "20px",
          }}
        >
          {/* Header voucher list + tombol tambah */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "rgba(249,243,227,0.35)",
                letterSpacing: "2px",
              }}
            >
              DAFTAR VOUCHER ({vouchers.length})
            </div>
            <button
              onClick={onAddVoucher}
              disabled={actionLoad === order.order_id + "_add"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "#22c55e",
                borderRadius: "8px",
                padding: "7px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Tajawal',sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(34,197,94,0.18)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(34,197,94,0.1)")
              }
            >
              {actionLoad === order.order_id + "_add"
                ? "⏳ Menambah..."
                : "+ Tambah Slot Voucher"}
            </button>
          </div>

          {vouchers.length === 0 ? (
            <div
              style={{
                fontSize: "14px",
                color: "rgba(249,243,227,0.25)",
                padding: "20px 0",
                textAlign: "center",
              }}
            >
              Belum ada voucher. Klik "+ Tambah Slot Voucher" untuk menambahkan.
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {vouchers.map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(201,168,76,0.08)",
                    borderRadius: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Info voucher */}
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "13px",
                      color: "#e8c96d",
                      letterSpacing: "1px",
                      minWidth: "140px",
                      flexShrink: 0,
                    }}
                  >
                    {v.kode_unik}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: "rgba(249,243,227,0.65)",
                      minWidth: "160px",
                    }}
                  >
                    {v.nama_jemaah ? (
                      <>
                        <strong style={{ color: "var(--cream)" }}>
                          {v.nama_jemaah}
                        </strong>
                        {v.kota_domisili ? ` · ${v.kota_domisili}` : ""}
                        {v.travel_tujuan ? ` · ${v.travel_tujuan}` : ""}
                      </>
                    ) : (
                      <span
                        style={{
                          color: "rgba(249,243,227,0.25)",
                          fontStyle: "italic",
                        }}
                      >
                        Belum diisi
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "50px",
                      background: statusBg(v.status),
                      color: statusColor(v.status),
                      border: `1px solid ${statusColor(v.status)}33`,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {statusLabel(v.status)}
                  </span>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {/* Tandai terpakai — hanya jika active */}
                    {v.status === "active" && (
                      <button
                        onClick={() => onMarkUsed(v.kode_unik)}
                        disabled={actionLoad === v.kode_unik + "_used"}
                        title="Tandai voucher sudah digunakan"
                        style={{
                          background: "rgba(96,165,250,0.1)",
                          color: "#60a5fa",
                          border: "1px solid rgba(96,165,250,0.25)",
                          borderRadius: "7px",
                          padding: "5px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "'Tajawal',sans-serif",
                          transition: "all 0.2s",
                        }}
                      >
                        {actionLoad === v.kode_unik + "_used"
                          ? "⏳"
                          : "✓ Terpakai"}
                      </button>
                    )}

                    {/* Reset data — hanya jika ada data */}
                    {(v.nama_jemaah || v.kota_domisili || v.travel_tujuan) && (
                      <button
                        onClick={() =>
                          onResetData(v.kode_unik, v.nama_jemaah || "")
                        }
                        disabled={actionLoad === v.kode_unik + "_reset"}
                        title="Kosongkan data jemaah (voucher tetap aktif)"
                        style={{
                          background: "rgba(234,179,8,0.08)",
                          color: "#eab308",
                          border: "1px solid rgba(234,179,8,0.2)",
                          borderRadius: "7px",
                          padding: "5px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "'Tajawal',sans-serif",
                          transition: "all 0.2s",
                        }}
                      >
                        {actionLoad === v.kode_unik + "_reset"
                          ? "⏳"
                          : "↺ Reset"}
                      </button>
                    )}

                    {/* Hapus voucher */}
                    <button
                      onClick={() =>
                        onDeleteVoucher(v.kode_unik, v.nama_jemaah || "")
                      }
                      disabled={actionLoad === v.kode_unik + "_delete"}
                      title="Hapus voucher ini secara permanen"
                      style={{
                        background: "rgba(255,80,80,0.08)",
                        color: "rgba(255,130,130,0.8)",
                        border: "1px solid rgba(255,100,100,0.2)",
                        borderRadius: "7px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Tajawal',sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {actionLoad === v.kode_unik + "_delete"
                        ? "⏳"
                        : "🗑 Hapus"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══ VOUCHERS TAB ═════════════════════════════════════════════
function VouchersTab({
  statusColor,
  statusBg,
  statusLabel,
}: {
  statusColor: (s: string) => string;
  statusBg: (s: string) => string;
  statusLabel: (s: string) => string;
}) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    import("@/lib/admin").then(({ getAllVouchers }) => {
      getAllVouchers()
        .then((v) => {
          setVouchers(v);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, []);

  const filtered = vouchers.filter((v) => {
    const matchStatus = filter === "all" || v.status === filter;
    const matchSearch =
      !search ||
      v.kode_unik.toLowerCase().includes(search.toLowerCase()) ||
      (v.nama_jemaah || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <input
          className="form-input"
          placeholder="🔍 Cari kode atau nama jemaah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "280px", padding: "10px 14px", fontSize: "14px" }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "pending", "active", "used", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "8px 12px",
                borderRadius: "50px",
                border: `1px solid ${filter === s ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)"}`,
                background:
                  filter === s ? "rgba(201,168,76,0.12)" : "transparent",
                color: filter === s ? "#e8c96d" : "rgba(249,243,227,0.4)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily:
                  "'Tajawal',sans-serif', fontWeight:filter===s?600:400",
              }}
            >
              {s === "all" ? "Semua" : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "rgba(249,243,227,0.3)",
          }}
        >
          ⏳ Memuat data...
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr 1fr 1fr 110px",
              padding: "12px 20px",
              background: "rgba(0,0,0,0.3)",
              borderBottom: "1px solid rgba(201,168,76,0.08)",
              fontSize: "11px",
              letterSpacing: "1.5px",
              color: "rgba(249,243,227,0.3)",
            }}
          >
            <div>KODE</div>
            <div>NAMA JEMAAH</div>
            <div>KOTA · TRAVEL</div>
            <div>RENCANA</div>
            <div>STATUS</div>
          </div>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "rgba(249,243,227,0.25)",
              }}
            >
              Tidak ada voucher ditemukan
            </div>
          ) : (
            filtered.map((v, i) => (
              <div
                key={v.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 1fr 1fr 110px",
                  padding: "13px 20px",
                  borderBottom: "1px solid rgba(201,168,76,0.05)",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                  fontSize: "13px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    color: "#e8c96d",
                    fontSize: "12px",
                    letterSpacing: "1px",
                  }}
                >
                  {v.kode_unik}
                </div>
                <div style={{ color: "var(--cream)", fontWeight: 600 }}>
                  {v.nama_jemaah || (
                    <span
                      style={{
                        color: "rgba(249,243,227,0.25)",
                        fontStyle: "italic",
                      }}
                    >
                      Belum diisi
                    </span>
                  )}
                </div>
                <div
                  style={{ color: "rgba(249,243,227,0.55)", fontSize: "12px" }}
                >
                  {v.kota_domisili}
                  {v.travel_tujuan ? ` · ${v.travel_tujuan}` : ""}
                </div>
                <div
                  style={{ color: "rgba(249,243,227,0.4)", fontSize: "12px" }}
                >
                  {v.rencana_penggunaan
                    ? new Date(v.rencana_penggunaan).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : "—"}
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "50px",
                      background: statusBg(v.status),
                      color: statusColor(v.status),
                      border: `1px solid ${statusColor(v.status)}33`,
                      fontWeight: 600,
                    }}
                  >
                    {statusLabel(v.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
