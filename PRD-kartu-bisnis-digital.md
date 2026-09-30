# PRD: Platform Kartu Bisnis Digital Berbasis QR

> Dokumen ini adalah spesifikasi lengkap untuk AI agent. Bangun sistem sesuai isi dokumen ini. Jika ada hal yang ambigu, pilih opsi paling sederhana yang sesuai dan catat asumsi di README.

---

## 1. Ringkasan Produk

Penjual mencetak kartu bisnis fisik yang memiliki **kode QR**. Ketika QR dipindai, pemindai diarahkan ke **halaman profil bisnis** (mobile-first) berisi nama bisnis, alamat, dan tombol-tombol yang sekali klik langsung membuka WhatsApp, Facebook, Instagram, dan TikTok milik bisnis tersebut.

Sistem terdiri dari dua bagian:

1. **Halaman Publik**: profil bisnis yang dibuka lewat QR (`/c/{slug}`).
2. **Panel Admin**: dipakai pemilik sistem (penjual kartu) untuk menambah, mengatur, dan melihat semua pembeli kartu beserta data pembelian.

## 2. Tujuan

- Pembeli kartu memiliki halaman profil yang rapi, cepat, dan mudah dibuka dari HP.
- Penjual bisa mengelola semua pelanggan dan pesanan dari satu tempat.
- Isi profil bisa diubah kapan saja **tanpa mencetak ulang kartu** (QR tidak berubah).

## 3. Non-Tujuan (di luar cakupan versi 1)

- Pembayaran online / payment gateway.
- Login untuk pembeli (pembeli tidak punya akun; semua diatur oleh admin).
- Aplikasi mobile native.
- Multi-admin dengan hak akses berbeda (cukup 1 peran admin).

## 4. Pengguna

| Peran | Deskripsi | Kebutuhan utama |
|---|---|---|
| **Admin (penjual)** | Pemilik sistem | Menambah pelanggan, mengedit profil, melihat riwayat pembelian, mengunduh QR, melihat statistik |
| **Pemilik bisnis (pembeli kartu)** | Tidak login | Profil bisnisnya tampil bagus di halaman publik |
| **Pengunjung** | Orang yang memindai QR | Melihat info bisnis dan menghubungi dengan cepat |

## 5. Konsep Kunci

- Setiap kartu memiliki **slug unik** permanen, misalnya `toko-maju-jaya`.
- QR berisi URL **`https://{domain}/c/{slug}`**. QR **tidak pernah berisi data langsung**, hanya URL ini. Karena itu, data profil bisa diubah tanpa mengganti QR.
- Admin dapat menonaktifkan profil (misal pembeli tidak membayar). Halaman publik lalu menampilkan pesan "Profil tidak aktif".

## 6. Fitur: Halaman Publik (`/c/{slug}`)

### 6.1 Konten yang ditampilkan
- Logo / foto profil (opsional)
- Nama bisnis
- Tagline atau deskripsi singkat (opsional, maks. 160 karakter)
- Alamat lengkap
- Tombol **Lihat di Peta** (membuka Google Maps dengan pencarian alamat; opsional koordinat)
- Tombol kontak dan sosial media, masing-masing hanya tampil jika terisi:
  - **WhatsApp** → `https://wa.me/{nomor_format_internasional}?text={pesan_awal_opsional}`
  - **Facebook** → URL profil/halaman
  - **Instagram** → `https://instagram.com/{username}`
  - **TikTok** → `https://tiktok.com/@{username}`
- Tombol **Simpan Kontak** yang mengunduh file `.vcf` (vCard) berisi nama bisnis, nomor telepon, alamat.
- Footer kecil "Dibuat oleh {nama penjual}" (bisa diatur admin).

### 6.2 Perilaku
- **Mobile-first**, satu kolom, tombol besar (tinggi min. 48px) dan mudah ditekan.
- Waktu muat cepat (target < 2 detik di jaringan 4G).
- Tema sederhana: warna aksen bisa diatur per profil (color picker di admin).
- Setiap klik tombol **dicatat** untuk statistik (lihat 8.3).
- Halaman menyertakan meta tag SEO dasar dan Open Graph (nama bisnis, deskripsi, logo) agar link enak dibagikan.
- Jika slug tidak ditemukan → halaman 404 yang ramah. Jika status nonaktif → halaman "Profil tidak aktif".

### 6.3 Normalisasi input (wajib)
- Nomor WhatsApp: terima `08xxxx`, `+628xxxx`, `628xxxx`, lalu simpan sebagai `628xxxx`.
- Username Instagram/TikTok: terima dengan atau tanpa `@`, atau URL lengkap, lalu simpan username saja.
- URL Facebook: wajib diawali `https://`; tambahkan otomatis jika tidak ada.

## 7. Fitur: Panel Admin (`/admin`)

### 7.1 Autentikasi
- Login dengan email + password. Password disimpan dengan hash (bcrypt/argon2).
- Sesi aman (cookie HttpOnly, SameSite=Lax), logout, dan proteksi semua rute `/admin/*`.
- Akun admin pertama dibuat lewat seed/environment variable (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- Rate limit pada login (misal 5 percobaan/menit/IP).

### 7.2 Dashboard
Kartu ringkasan:
- Total pelanggan
- Total kartu aktif / nonaktif
- Total pesanan dan total pendapatan (dari data pesanan)
- Total scan/kunjungan 7 hari dan 30 hari terakhir
- Daftar 5 pesanan terbaru
- Daftar 5 profil paling banyak dikunjungi

### 7.3 Manajemen Pelanggan / Kartu (CRUD)
Halaman daftar dengan:
- Tabel: nama bisnis, nama pemilik, slug, status, tanggal dibuat, jumlah kunjungan
- Pencarian (nama bisnis, pemilik, nomor WA, slug)
- Filter status (aktif/nonaktif) dan urutan (terbaru, terlama, terbanyak dikunjungi)
- Pagination
- Aksi per baris: lihat, edit, aktif/nonaktifkan, hapus (dengan konfirmasi)

Form tambah/edit pelanggan:

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Nama bisnis | teks | ya | |
| Nama pemilik | teks | ya | untuk data internal |
| Slug | teks | ya | otomatis dari nama bisnis, bisa diedit, harus unik, hanya `a-z 0-9 -` |
| Tagline | teks | tidak | maks. 160 karakter |
| Logo | upload gambar | tidak | jpg/png/webp, maks. 2 MB, dikompres otomatis |
| Alamat | teks panjang | ya | |
| Link Google Maps | URL | tidak | jika kosong dibuat dari alamat |
| No. WhatsApp | teks | ya | normalisasi otomatis |
| Pesan awal WhatsApp | teks | tidak | contoh: "Halo, saya lihat kartu bisnis Anda" |
| Facebook | URL | tidak | |
| Instagram | username | tidak | |
| TikTok | username | tidak | |
| Warna aksen | color | tidak | default ada |
| Status | toggle | ya | default aktif |
| Catatan internal | teks | tidak | hanya terlihat admin |

Ada **pratinjau langsung** halaman publik di samping/atas form.

### 7.4 Manajemen Pembelian / Pesanan
Setiap pelanggan dapat memiliki **satu atau lebih pesanan**.

Field pesanan:
- Pelanggan (relasi)
- Tanggal pembelian
- Jumlah kartu yang dibeli
- Paket/jenis kartu (teks bebas atau pilih dari daftar paket)
- Harga total (Rupiah)
- Status pembayaran: `belum_bayar`, `dp`, `lunas`
- Status produksi/pengiriman: `menunggu`, `dicetak`, `dikirim`, `selesai`
- Catatan

Fitur:
- Tambah pesanan dari halaman detail pelanggan atau dari halaman Pesanan.
- Halaman **Pesanan** berisi tabel seluruh pesanan dengan filter (status bayar, status produksi, rentang tanggal) dan pencarian nama pelanggan.
- Ubah status langsung dari tabel.
- **Ekspor CSV** untuk daftar pelanggan dan pesanan.

### 7.5 Generator QR
Di halaman detail pelanggan:
- Menampilkan QR yang mengarah ke `https://{domain}/c/{slug}`.
- Tombol unduh: **PNG** (resolusi tinggi, min. 1000x1000) dan **SVG** (untuk cetak).
- Opsi: warna QR, margin (quiet zone), tingkat koreksi error tinggi (H), dan opsi menaruh logo kecil di tengah.
- Tombol **Unduh semua QR** (ZIP) untuk pelanggan yang dipilih.
- Jika slug diubah, tampilkan peringatan: "QR lama yang sudah tercetak akan tidak berfungsi." Sebaiknya slug **dikunci** setelah ada pesanan, dan hanya bisa dibuka dengan konfirmasi.

### 7.6 Statistik
Per pelanggan dan global:
- Jumlah kunjungan halaman (scan) per hari (grafik garis 30 hari)
- Klik per tombol (WhatsApp, Facebook, Instagram, TikTok, Peta, Simpan Kontak)
- Perangkat (mobile/desktop) secara kasar dari user-agent
- Tidak menyimpan IP mentah; simpan hash IP + tanggal saja untuk menghitung pengunjung unik.

### 7.7 Pengaturan
- Nama penjual dan teks footer halaman publik
- Domain dasar (untuk QR)
- Ganti password admin

## 8. Model Data

```
admins
  id, email (unik), password_hash, created_at

customers                      -- 1 baris = 1 profil kartu
  id, slug (unik, index), business_name, owner_name, tagline,
  logo_path, address, maps_url, whatsapp, whatsapp_message,
  facebook_url, instagram_username, tiktok_username,
  accent_color, is_active (bool), internal_note,
  created_at, updated_at

orders
  id, customer_id (FK), order_date, quantity, package_name,
  total_price (integer, rupiah),
  payment_status (enum: belum_bayar | dp | lunas),
  production_status (enum: menunggu | dicetak | dikirim | selesai),
  note, created_at, updated_at

page_views
  id, customer_id (FK, index), viewed_at (index),
  ip_hash, device_type

link_clicks
  id, customer_id (FK, index), link_type
  (enum: whatsapp | facebook | instagram | tiktok | maps | vcard),
  clicked_at (index)

settings
  key (unik), value
```

Relasi: `customers 1—N orders`, `customers 1—N page_views`, `customers 1—N link_clicks`.
Hapus pelanggan → gunakan **soft delete** (kolom `deleted_at`) agar riwayat pesanan tidak hilang.

## 9. Rute / Endpoint

**Publik**
- `GET /c/{slug}` : halaman profil
- `GET /c/{slug}/vcard` : unduh `.vcf`
- `POST /api/track/click` : body `{slug, link_type}` (dicatat tanpa memblokir pengalihan)

**Admin** (semua butuh login)
- `GET/POST /admin/login`, `POST /admin/logout`
- `GET /admin` : dashboard
- `GET /admin/customers`, `GET /admin/customers/new`, `POST /admin/customers`
- `GET /admin/customers/{id}`, `GET /admin/customers/{id}/edit`, `PUT /admin/customers/{id}`, `DELETE /admin/customers/{id}`
- `GET /admin/customers/{id}/qr?format=png|svg`
- `GET /admin/orders`, `POST /admin/orders`, `PUT /admin/orders/{id}`, `DELETE /admin/orders/{id}`
- `GET /admin/export/customers.csv`, `GET /admin/export/orders.csv`
- `GET /admin/stats`
- `GET/PUT /admin/settings`

## 10. Saran Teknologi

Agent boleh memilih stack lain bila alasannya jelas, tetapi default yang disarankan (sederhana dan murah untuk dihosting):

- **Framework**: Next.js (App Router) + TypeScript
- **Database**: PostgreSQL (atau SQLite untuk tahap awal) dengan Prisma ORM
- **Styling**: Tailwind CSS
- **QR**: library `qrcode` (PNG dan SVG)
- **Auth**: session berbasis cookie (misal Auth.js atau implementasi sendiri dengan hash argon2/bcrypt)
- **Penyimpanan logo**: folder lokal atau object storage (S3-compatible)
- **Deploy**: VPS dengan Docker atau Vercel + database terkelola

## 11. Keamanan & Kualitas

- Validasi semua input di server (zod atau setara); escape output untuk mencegah XSS.
- Validasi upload: cek tipe MIME dan ukuran, ubah nama file acak.
- Proteksi CSRF pada form admin; rate limit pada login dan endpoint tracking.
- Link eksternal memakai `rel="noopener noreferrer"`.
- HTTPS wajib di produksi.
- Backup database berkala (dokumentasikan caranya).
- Halaman publik tidak boleh menampilkan data internal (catatan internal, data pesanan).
- Aksesibilitas dasar: kontras cukup, label tombol jelas, ukuran sentuh memadai.

## 12. Kriteria Penerimaan (Acceptance Criteria)

1. Admin dapat login dan mengakses dashboard; pengguna tanpa login tidak bisa membuka `/admin/*`.
2. Admin dapat menambah pelanggan dengan semua field; slug otomatis dan unik.
3. Memindai QR pelanggan membuka `/c/{slug}` yang menampilkan nama, alamat, dan tombol yang terisi saja.
4. Menekan tombol WhatsApp membuka chat ke nomor yang benar; Instagram, Facebook, dan TikTok membuka akun yang benar.
5. Mengubah data pelanggan di admin langsung mengubah halaman publik tanpa mengganti QR.
6. Menonaktifkan pelanggan membuat halaman publik menampilkan "Profil tidak aktif".
7. Admin dapat menambah pesanan untuk pelanggan, mengubah status bayar dan produksi, serta melihat daftar seluruh pembeli dan pesanannya.
8. QR dapat diunduh dalam PNG dan SVG dan dapat dipindai dengan HP biasa.
9. Kunjungan halaman dan klik tombol tercatat dan tampil di statistik.
10. Ekspor CSV pelanggan dan pesanan berfungsi.
11. Halaman publik tampil baik pada layar 360px hingga desktop dan Lighthouse mobile performance ≥ 85.

## 13. Fase Pengerjaan (urutan yang disarankan)

**Fase 1: MVP**
Auth admin, CRUD pelanggan, halaman publik, generator QR (PNG/SVG), CRUD pesanan, daftar pembeli.

**Fase 2**
Pelacakan kunjungan dan klik, dashboard statistik, vCard, ekspor CSV, pratinjau langsung.

**Fase 3 (opsional)**
Unduh QR massal (ZIP), paket harga bawaan, tema halaman publik ganda, dukungan domain kustom per pelanggan, portal pembeli untuk mengedit profil sendiri lewat link/kode rahasia.

## 14. Output yang Diharapkan dari AI Agent

- Kode sumber lengkap dan rapi dalam satu repositori.
- File `README.md` berisi cara instalasi, variabel environment, cara migrasi database, cara membuat admin pertama, dan cara deploy.
- Seed data contoh (minimal 3 pelanggan dan 5 pesanan) untuk demo.
- Daftar asumsi yang diambil agent selama pengerjaan.

## 15. Pertanyaan Terbuka (isi sebelum diberikan ke agent, jika sudah tahu)

- Nama brand / domain yang akan dipakai: `__________`
- Apakah pembeli nanti boleh mengedit profilnya sendiri (Fase 3)? `ya / tidak`
- Apakah ada paket harga tetap? Daftar: `__________`
- Bahasa antarmuka: Indonesia (default)
