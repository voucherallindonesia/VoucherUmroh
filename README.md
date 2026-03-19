# Voucher Umroh — Website

Website penjualan voucher diskon umroh berbasis Next.js 14 + Supabase.

## Tech Stack
- **Next.js 14** (SSG export)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (database)
- **GitHub Pages** (hosting)

## Halaman
- `/` — Landing page marketing
- `/register` — Registrasi data jemaah
- `/tracking` — Tracking & download digital card

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/username/voucher-umroh.git
cd voucher-umroh
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
# Isi dengan kredensial Supabase kamu
```

### 3. Supabase Setup
Jalankan SQL ini di Supabase SQL Editor:
```sql
-- Tabel orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  nama_pembeli text not null,
  no_whatsapp text not null,
  jumlah_voucher int not null default 1,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Tabel vouchers
create table vouchers (
  id uuid primary key default gen_random_uuid(),
  kode_unik text unique not null,
  order_id text references orders(order_id),
  nama_jemaah text,
  kota_domisili text,
  travel_tujuan text,
  rencana_penggunaan date,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Row Level Security
alter table orders  enable row level security;
alter table vouchers enable row level security;

-- RLS Policies (public read by key, insert only)
create policy "allow_insert_orders"   on orders   for insert with check (true);
create policy "allow_select_orders"   on orders   for select using (true);
create policy "allow_insert_vouchers" on vouchers for insert with check (true);
create policy "allow_select_vouchers" on vouchers for select using (true);
```

### 4. GitHub Secrets
Tambahkan secrets di Settings → Secrets → Actions:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_PAYMENT_URL`
- `NEXT_PUBLIC_WA_NUMBER`

### 5. Enable GitHub Pages
Settings → Pages → Source: **GitHub Actions**

### 6. Deploy
```bash
git add .
git commit -m "initial commit"
git push origin main
```
GitHub Actions akan otomatis build dan deploy!

## Development
```bash
npm run dev   # http://localhost:3000
npm run build # Build untuk production
```
