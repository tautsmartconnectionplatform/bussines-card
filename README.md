# 💳 Kartu Bisnis Digital Berbasis QR

Platform lengkap dan modern untuk penyedia/percetakan kartu nama digital. Menghubungkan kartu nama fisik ber-QR dengan profil bisnis pintar mobile-first yang cepat, interaktif, dan dapat diperbarui kapan saja tanpa mencetak ulang kartu.

---

## 🌟 Fitur Utama

### 📱 1. Halaman Profil Publik (`/c/{slug}`)
- **Mobile-First & Ultra-Cepat**: Tampilan satu kolom yang responsif, rapi, dan cepat (< 2 detik).
- **Tombol Sekali Klik**:
  - **WhatsApp**: Membuka chat langsung dengan pesan awal terformat otomatis (`wa.me/628...`).
  - **Petunjuk Arah (Maps)**: Buka lokasi di Google Maps otomatis.
  - **Media Sosial**: Instagram, TikTok, dan Facebook (hanya tampil jika diisi).
  - **Simpan Kontak (.vcf)**: Unduh kartu nama digital vCard 3.0 langsung ke kontak HP pengunjung.
  - **Bagikan**: Web Share API bawaan atau salin tautan profil dalam satu klik.
- **Warna Aksen Kustom**: Setiap profil bisnis memiliki palet dan aksen warna unik.
- **Privacy-Friendly Tracking**: Kunjungan dan klik tombol dicatat otomatis tanpa menyimpan data IP mentah.

### 🔐 2. Panel Admin Lengkap (`/admin`)
- **Autentikasi Aman**: Session cookie `HttpOnly` + `SameSite=Lax`, bcrypt password hashing, dan proteksi brute-force rate limit.
- **Dashboard Ringkasan**:
  - Total pelanggan, omzet pesanan kartu, dan statistik scan 7 & 30 hari.
  - Grafik visual aktivitas scan 14 & 30 hari terakhir.
  - Daftar 5 pesanan terbaru & 5 profil bisnis paling populer.
- **Manajemen Pelanggan (CRUD)**:
  - Form tambah/edit dengan **Pratinjau Langsung (Live Preview)** kartu mobile di samping form.
  - Normalisasi otomatis nomor WhatsApp (`08xx` -> `628xx`), username medsos, dan URL.
  - Soft-delete pelanggan untuk menjaga integritas riwayat pesanan.
- **Generator & Kustomisasi QR Code**:
  - Unduh **PNG High Resolution (1200x1200px)** dan **SVG Vector** siap cetak.
  - Pengaturan warna QR, warna latar, dan quiet zone margin.
  - Unduh massal file QR dalam format **ZIP**.
- **Manajemen Pesanan & Pembelian**:
  - Pelacakan status bayar (`belum_bayar`, `dp`, `lunas`) dan status produksi (`menunggu`, `dicetak`, `dikirim`, `selesai`).
  - Ubah status instan langsung dari tabel pesanan.
- **Ekspor CSV**: Unduh data pelanggan dan data pesanan dalam format CSV (UTF-8 BOM siap Microsoft Excel).
- **Statistik & Analitik Mendalam**: Analisis distribusi klik tombol dan tipe perangkat pengunjung (Mobile vs Desktop).
- **Pengaturan Sistem**: Konfigurasi nama penjual, teks footer kartu publik, domain dasar QR, dan ganti kata sandi admin.

---

## 🛠️ Stack Teknologi

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database & ORM**: SQLite + Prisma ORM (Dapat beralih ke PostgreSQL dengan mengubah provider di `schema.prisma`)
- **Styling**: Tailwind CSS + Glassmorphism + Lucide Icons
- **Autentikasi**: Native Web Crypto + JWT Session Cookie + Bcrypt
- **QR Engine**: `qrcode` (PNG Raster 1200px & SVG Vector) + `jszip` (Batch Export)
- **Validasi**: Zod Schema Server-Side Validation

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Kloning & Install Dependensi
```bash
git clone <repo-url>
cd kartu-bisnis
npm install
```

### 2. Konfigurasi Environment Variable
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Isi variabel di `.env`:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="kartu-bisnis-super-secret-key-change-me-in-production-min-32-chars"
ADMIN_EMAIL="admin@kartubisnis.com"
ADMIN_PASSWORD="adminpassword123"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Migrasi Database & Seed Data Demo
Jalankan sinkronisasi schema database dan masukkan data contoh (4 pelanggan contoh, 5 riwayat pesanan, dan analitik 30 hari):
```bash
npm run db:push
npm run db:seed
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser di:
- **Halaman Utama**: [http://localhost:3000](http://localhost:3000)
- **Panel Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Contoh Profil Publik**: [http://localhost:3000/c/kopi-nusantara](http://localhost:3000/c/kopi-nusantara)

---

## 🔑 Kredensial Login Admin Default

| Field | Nilai Default |
|---|---|
| **Email** | `admin@kartubisnis.com` |
| **Password** | `adminpassword123` |

*(Dapat diubah kapan saja di menu Pengaturan Admin)*

---

## 🧪 Menjalankan Automated Self-Check

Sesuai standar Senior Dev mode, sistem dilengkapi dengan runnable check otomatis tanpa dependensi berlebih:
```bash
npm run test:check
```
Memeriksa:
1. Normalisasi WhatsApp internasional (`08xx`, `+62xx`, `8xx`)
2. Normalisasi username Instagram & TikTok
3. Pembuatan slug unik URL-friendly
4. Sintaks generator file vCard 3.0
5. Generator QR Code (SVG & High-Res PNG)
6. Enkripsi dan verifikasi kata sandi bcrypt
7. Koneksi database SQLite dan integritas relasi data

---

## 🚢 Panduan Deployment (Produksi)

### Build Aplikasi
```bash
npm run build
npm run start
```

### Deployment dengan Docker (Opsional)
Aplikasi berbasis Next.js mandiri (*standalone*) dapat dijalankan di VPS (seperti Ubuntu, DigitalOcean, Hetzner, AWS EC2) dengan Dockerfile sederhana atau menggunakan PM2:
```bash
pm2 start npm --name "kartu-bisnis" -- start
```

---

## 📋 Catatan Asumsi & Desain (Sesuai PRD)

1. **Penyimpanan Gambar Logo**: Disimpan secara lokal di direktori `public/uploads/` dengan nama acak UUID dan validasi format MIME (JPG, PNG, WEBP maks 2 MB) untuk kesederhanaan *zero-cost self hosting*.
2. **Keamanan Privasi Analitik**: Sistem tidak mencatat IP mentah pengunjung, melainkan menghasilkan `ipHash` (kombinasi IP + tanggal) untuk menghitung pengunjung unik per hari tanpa melanggar privasi.
3. **Peringatan Perubahan Slug**: Mengubah slug profil yang sudah ada akan memunculkan peringatan pada formulir karena QR fisik yang sudah tercetak akan mengarah ke URL slug lama.
4. **Soft Delete Pelanggan**: Saat pelanggan dihapus, kolom `deletedAt` diisi sehingga data riwayat pesanan fisik dan omzet masa lalu tetap utuh dan tercatat di database.
