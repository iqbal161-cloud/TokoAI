# TokoAI — Asisten Bisnis UMKM Berbasis AI 

TokoAI adalah aplikasi web berbasis Generative AI yang dirancang untuk membantu pelaku UMKM Indonesia mengelola bisnisnya secara lebih efisien — mulai dari pembuatan konten pemasaran, pencatatan keuangan, hingga balasan otomatis untuk pelanggan WhatsApp. 

##  Latar Belakang

Indonesia memiliki lebih dari 64 juta pelaku UMKM, namun hanya sebagian kecil yang benar-benar berhasil mengadopsi teknologi digital dalam operasional bisnisnya. Kendala utama bukan soal akses teknologi, melainkan kompleksitas penggunaannya. TokoAI hadir sebagai solusi yang dirancang khusus untuk pengguna non-teknis, berbahasa Indonesia, dan dapat diakses dari perangkat mobile.

##  Fitur Utama

### 1. Generator Konten Pemasaran
Pengguna mengunggah foto produk dan menuliskan deskripsi singkat, lalu AI akan menghasilkan:
- Caption Instagram lengkap dengan hashtag
- Deskripsi produk untuk Shopee/Tokopedia
- Teks iklan untuk Facebook/WhatsApp Story
- Caption dalam Bahasa Inggris untuk pasar internasional

**Cara menulis deskripsi yang baik**: sebutkan jenis produk, target pembeli, ciri khas (warna/bahan/ukuran), dan harga. Semakin detail deskripsinya, semakin relevan hasil captionnya.

> Contoh: *"baju batik anak perempuan umur 5-8 tahun, warna merah, bahan katun adem, harga Rp 85.000"*
> Contoh lain: *"keripik singkong rasa balado, kemasan 250gr, tanpa pengawet, cocok untuk oleh-oleh, harga Rp 20.000"*

### 2. Pencatatan Keuangan via Chat
Pengguna mencatat transaksi dengan mengetik kalimat natural seperti chat. AI akan mem-parsing teks tersebut menjadi data terstruktur (jumlah, harga jual, modal, keuntungan) dan menyimpannya secara otomatis, lengkap dengan ringkasan omzet dan keuntungan secara real-time. Tanggal transaksi diambil otomatis dari tanggal saat pencatatan dilakukan, bukan ditebak oleh AI dari teks.

**Format yang disarankan**: `[jual/beli] [jumlah] [barang] [harga] modal [harga modal]`

> Contoh: *"jual 3 baju batik @85rb modal 60rb"*, *"jual 1 tas anyaman seharga 120000 modal 75rb"*, *"beli stok kain 500ribu"*, *"jual 5 kerupuk @5rb modal 2rb per bungkus"*

### 3. Template Balasan WhatsApp
Pengguna memasukkan informasi toko dan katalog produk, lalu AI menghasilkan template balasan siap pakai untuk pertanyaan pelanggan yang umum: harga, stok, ongkos kirim, cara order, hingga follow-up.

**Informasi yang sebaiknya diisi**: nama toko, daftar produk & harga, cara kirim, dan cara bayar.

> Contoh katalog: *"Nama toko: Batik Bu Sari. Produk: Baju batik anak (Rp 85.000), dewasa (Rp 150.000-250.000). Bahan: Katun adem, motif cap khas Solo. Pengiriman: JNE, J&T, Gojek/Grab (area Solo), COD tersedia. Pembayaran: Transfer BCA/Mandiri atau COD. WA: 081234567890"*

Pengguna juga dapat menambahkan pertanyaan spesifik seperti *"Ada diskon?"*, *"Bisa custom?"*, *"Garansi berapa lama?"*, *"Min order berapa?"*, *"Bisa retur?"*, *"Ada ukuran XXL?"*, atau *"Bisa COD?"* untuk mendapatkan template balasan tambahan di luar enam template standar.

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| AI Engine | Google Gemini API (gemini-2.0-flash) |
| Database & Auth | Supabase (PostgreSQL, Row Level Security) |
| Storage | Supabase Storage |
| Icon | Tabler Icons |
| Deployment | Vercel |

## 📁 Struktur Project

```
tokoai/
├── app/
│   ├── (auth)/
│   │   └── login/              # Halaman login & registrasi
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard utama
│   │   ├── konten/             # Generator Konten Pemasaran
│   │   ├── keuangan/           # Pencatatan Keuangan
│   │   └── whatsapp/           # Template WhatsApp
│   ├── api/
│   │   ├── generate-konten/    # API route Gemini untuk konten
│   │   ├── catat-transaksi/    # API route Gemini untuk parsing keuangan
│   │   └── generate-template/  # API route Gemini untuk template WA
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── gemini.ts                # Gemini client
└── .env.local                  # Environment variables
```

## 🗄️ Skema Database

Aplikasi menggunakan 4 tabel utama di Supabase, seluruhnya dilindungi dengan Row Level Security (RLS) sehingga setiap pengguna hanya dapat mengakses datanya sendiri:

- **profiles** — menyimpan data profil toko pengguna
- **transaksi** — menyimpan riwayat transaksi keuangan
- **produk** — menyimpan katalog produk
- **konten_history** — menyimpan riwayat konten yang pernah digenerate

## 🚀 Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js terinstal
- Akun [Supabase](https://supabase.com) (gratis)
- API Key [Google Gemini](https://aistudio.google.com) (gratis)

### Langkah Instalasi

```bash
# Clone atau ekstrak project
cd tokoai

# Install dependencies
npm install
```

### Konfigurasi Environment

Buat file `.env.local` di root project:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Setup Database

Jalankan skrip SQL berikut di Supabase SQL Editor untuk membuat seluruh tabel, mengaktifkan RLS, dan menambahkan policy akses:

```sql
create extension if not exists "uuid-ossp";

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nama_toko text,
  kategori text,
  no_wa text,
  created_at timestamp with time zone default now()
);

create table transaksi (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  deskripsi_asli text not null,
  qty integer,
  harga_jual integer,
  modal integer,
  profit integer,
  tanggal date default current_date,
  created_at timestamp with time zone default now()
);

create table produk (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  nama text not null,
  harga integer,
  stok integer,
  foto_url text,
  created_at timestamp with time zone default now()
);

create table konten_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  foto_url text,
  deskripsi_produk text,
  hasil_caption text,
  hasil_shopee text,
  hasil_english text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;
alter table transaksi enable row level security;
alter table produk enable row level security;
alter table konten_history enable row level security;

create policy "Users can manage own profile" on profiles
  for all using (auth.uid() = id);

create policy "Users can manage own transaksi" on transaksi
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own produk" on produk
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own konten" on konten_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Buat juga Storage bucket bernama `produk-images` dengan akses publik untuk menyimpan foto produk.

### Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi dapat diakses melalui `http://localhost:3000`.

## 🩹 Troubleshooting

### Error "violates foreign key constraint transaksi_user_id_fkey"

Error ini terjadi apabila baris pada tabel `profiles` tidak terbentuk secara otomatis saat proses registrasi (race condition antara proses signup dan insert profil). Akibatnya, `user_id` yang dirujuk oleh tabel `transaksi`, `produk`, atau `konten_history` tidak ditemukan di tabel `profiles`.

**Solusi sementara**: tambahkan baris profil secara manual melalui Supabase SQL Editor, sesuaikan `id` dengan UID pengguna yang bermasalah (dapat dilihat di Authentication → Users):

```sql
INSERT INTO profiles (id, nama_toko, kategori, no_wa)
VALUES ('uid-pengguna-di-sini', 'Nama Toko', '', '');
```

**Solusi permanen yang disarankan**: gunakan Supabase Database Trigger agar baris `profiles` otomatis dibuat setiap kali ada pengguna baru di `auth.users`, alih-alih mengandalkan insert manual dari sisi client setelah `signUp()`.

### Error "No API key found in request"

Pastikan environment variable `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local` sudah benar, lalu restart development server (`npm run dev`) karena Next.js hanya membaca environment variable saat server pertama kali dijalankan.

### Error "404 model is not found" pada Gemini API

Model Gemini terus diperbarui oleh Google, sehingga nama model seperti `gemini-1.5-flash` dapat dideprecate. Gunakan model yang sedang aktif, contohnya `gemini-2.0-flash`, dan sesuaikan di seluruh API route (`generate-konten`, `catat-transaksi`, `generate-template`).

## 🇮🇩 Dibuat Untuk

UMKM Indonesia — dengan harapan dapat membantu pelaku usaha kecil bersaing lebih setara di ekosistem digital.
