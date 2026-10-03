const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database...");

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@kartubisnis.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });
  console.log(`✅ Admin terdaftar: ${admin.email}`);

  // 2. Seed Settings
  const defaultSettings = [
    { key: "seller_name", value: "TautSmart Indonesia" },
    { key: "footer_text", value: "Dibuat oleh TautSmart" },
    { key: "base_domain", value: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Pengaturan default tersimpan");

  // 3. Seed Customers
  const customer1 = await prisma.customer.upsert({
    where: { slug: "kopi-nusantara" },
    update: {
      jobTitle: "Founder & Master Roaster",
      email: "budi@kopinusantara.id",
      phone: "6281234567890",
      city: "Jakarta Selatan",
      website: "https://kopinusantara.id",
      linkedinUrl: "https://linkedin.com/in/budisantoso-kopi",
    },
    create: {
      slug: "kopi-nusantara",
      businessName: "Kopi Nusantara Artisan Roastery",
      ownerName: "Budi Santoso",
      jobTitle: "Founder & Master Roaster",
      email: "budi@kopinusantara.id",
      phone: "6281234567890",
      city: "Jakarta Selatan",
      website: "https://kopinusantara.id",
      tagline: "Kopi single-origin pilihan terbaik dari seluruh pelosok Nusantara ☕",
      address: "Jl. Senopati No. 45, Kebayoran Baru",
      mapsUrl: "https://maps.google.com/?q=Jl.+Senopati+No.+45+Jakarta",
      whatsapp: "6281234567890",
      whatsappMessage: "Halo Kopi Nusantara, saya tertarik untuk memesan beans / reservasi tempat.",
      facebookUrl: "https://facebook.com/kopinusantara.id",
      instagramUsername: "kopinusantara.roastery",
      tiktokUsername: "kopinusantara.official",
      linkedinUrl: "https://linkedin.com/in/budisantoso-kopi",
      accentColor: "#D97706", // Amber 600
      isActive: true,
      internalNote: "Pelanggan VIP, order 200 kartu NFC dan cetak QR.",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { slug: "senyum-sehat-dental" },
    update: {
      jobTitle: "Dokter Gigi Spesialis Ortodonti",
      email: "halo@senyumsehatdental.com",
      phone: "6281987654321",
      city: "Sukabumi",
      website: "https://senyumsehatdental.com",
    },
    create: {
      slug: "senyum-sehat-dental",
      businessName: "Klinik Gigi Senyum Sehat",
      ownerName: "drg. Amanda Putri",
      jobTitle: "Dokter Gigi Spesialis Ortodonti",
      email: "halo@senyumsehatdental.com",
      phone: "6281987654321",
      city: "Sukabumi",
      website: "https://senyumsehatdental.com",
      tagline: "Perawatan gigi modern, nyaman, dan ramah keluarga untuk senyum percaya diri Anda ✨",
      address: "Jl. Bhayangkara No. 42, Gunungpuyuh",
      mapsUrl: "https://maps.google.com/?q=Sukabumi",
      whatsapp: "6281987654321",
      whatsappMessage: "Halo Klinik Senyum Sehat, saya ingin buat janji konsultasi dokter gigi.",
      facebookUrl: "https://facebook.com/senyumsehatdental",
      instagramUsername: "senyumsehat.dental",
      tiktokUsername: "drg.amandaputri",
      accentColor: "#059669", // Emerald 600
      isActive: true,
      internalNote: "Klinik gigi spesialis, mau repeat order bulan depan.",
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { slug: "autojaya-motor" },
    update: {
      jobTitle: "Kepala Bengkel & Mekanik Senior",
      email: "service@autojayamotor.com",
      phone: "6285711223344",
      city: "Tangerang Selatan",
      website: "https://autojayamotor.com",
    },
    create: {
      slug: "autojaya-motor",
      businessName: "Bengkel Mobil AutoJaya Motor",
      ownerName: "Hendrik Wijaya",
      jobTitle: "Kepala Bengkel & Mekanik Senior",
      email: "service@autojayamotor.com",
      phone: "6285711223344",
      city: "Tangerang Selatan",
      website: "https://autojayamotor.com",
      tagline: "Servis berkala, tune-up, ganti oli cepat dan bergaransi resmi 🚗🔧",
      address: "Jl. Raya Serpong KM 7 No. 88",
      mapsUrl: "https://maps.google.com/?q=Jl.+Raya+Serpong+KM+7",
      whatsapp: "6285711223344",
      whatsappMessage: "Halo Bengkel AutoJaya, mobil saya butuh booking servis berkala.",
      facebookUrl: "https://facebook.com/autojayamotor",
      instagramUsername: "autojaya.service",
      tiktokUsername: "autojaya_mechanic",
      accentColor: "#DC2626", // Red 600
      isActive: true,
      internalNote: "Order paket hemat 50 pcs.",
    },
  });

  const customer4 = await prisma.customer.upsert({
    where: { slug: "dapur-bunda-ina" },
    update: {},
    create: {
      slug: "dapur-bunda-ina",
      businessName: "Katering & Kue Dapur Bunda Ina",
      ownerName: "Ina Marlina",
      tagline: "Katering harian, nasi kotak acara, dan kue tradisional gurih & lezat 🍱",
      address: "Jl. Tebet Barat Dalam Raya No. 18, Jakarta Selatan",
      mapsUrl: "https://maps.google.com/?q=Jl.+Tebet+Barat+Dalam+Raya",
      whatsapp: "6287899887766",
      whatsappMessage: "Halo Dapur Bunda Ina, boleh minta pricelist nasi box dan snack box?",
      facebookUrl: "https://facebook.com/dapurbundaina",
      instagramUsername: "dapurbundaina",
      tiktokUsername: "bundainamasak",
      accentColor: "#EA580C", // Orange 600
      isActive: false, // Contoh non-aktif
      internalNote: "Sedang jeda operasional sementara.",
    },
  });
  console.log("✅ 4 Pelanggan contoh berhasil dibuat");

  // 4. Seed Orders
  const ordersData = [
    {
      customerId: customer1.id,
      orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 hari lalu
      quantity: 100,
      packageName: "Paket Premium Matte Black + NFC",
      totalPrice: 450000,
      paymentStatus: "lunas",
      productionStatus: "selesai",
      note: "Dikirim via Paxel ke Senopati.",
    },
    {
      customerId: customer1.id,
      orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 hari lalu
      quantity: 100,
      packageName: "Paket Cetak Tambahan 100 pcs",
      totalPrice: 250000,
      paymentStatus: "lunas",
      productionStatus: "dikirim",
      note: "Resi JNE: JNE123987456.",
    },
    {
      customerId: customer2.id,
      orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 hari lalu
      quantity: 200,
      packageName: "Paket Klinik Komplit (200 pcs UV Spot)",
      totalPrice: 750000,
      paymentStatus: "lunas",
      productionStatus: "selesai",
      note: "Packaging khusus box akrilik.",
    },
    {
      customerId: customer3.id,
      orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 hari lalu
      quantity: 50,
      packageName: "Paket Starter 50 pcs",
      totalPrice: 150000,
      paymentStatus: "dp",
      productionStatus: "dicetak",
      note: "DP Rp 75.000 via BCA. Pelunasan saat siap kirim.",
    },
    {
      customerId: customer4.id,
      orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 hari lalu
      quantity: 50,
      packageName: "Paket Starter 50 pcs",
      totalPrice: 150000,
      paymentStatus: "belum_bayar",
      productionStatus: "menunggu",
      note: "Menunggu konfirmasi pembayaran.",
    },
  ];

  for (const o of ordersData) {
    await prisma.order.create({ data: o });
  }
  console.log("✅ 5 Pesanan contoh berhasil dibuat");

  // 5. Seed Realistic Analytics (PageViews & LinkClicks)
  const customers = [customer1, customer2, customer3];
  const linkTypes = ["whatsapp", "facebook", "instagram", "tiktok", "maps", "vcard"];
  const devices = ["mobile", "desktop", "mobile", "mobile", "tablet"];

  const pageViewsBatch = [];
  const linkClicksBatch = [];

  for (let d = 30; d >= 0; d--) {
    const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    for (const cust of customers) {
      // Buat 2-8 page views per customer per hari
      const viewCount = Math.floor(Math.random() * 7) + 2;
      for (let i = 0; i < viewCount; i++) {
        const viewTime = new Date(date.getTime() + Math.random() * 86400000);
        pageViewsBatch.push({
          customerId: cust.id,
          viewedAt: viewTime,
          ipHash: "hash_" + Math.floor(Math.random() * 100),
          deviceType: devices[Math.floor(Math.random() * devices.length)],
        });

        // 50% peluang pengunjung klik link
        if (Math.random() > 0.4) {
          const ltype = linkTypes[Math.floor(Math.random() * linkTypes.length)];
          linkClicksBatch.push({
            customerId: cust.id,
            linkType: ltype,
            clickedAt: new Date(viewTime.getTime() + 10000),
          });
        }
      }
    }
  }

  if (pageViewsBatch.length > 0) {
    await prisma.pageView.createMany({ data: pageViewsBatch });
  }
  if (linkClicksBatch.length > 0) {
    await prisma.linkClick.createMany({ data: linkClicksBatch });
  }

  console.log("✅ Data statistik simulasi 30 hari berhasil dibuat");
  console.log("🚀 Selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
