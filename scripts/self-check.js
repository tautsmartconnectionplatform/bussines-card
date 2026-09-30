const assert = require("assert");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");

// 1. Normalization Logic Checks
function normalizeWhatsApp(input) {
  if (!input) return "";
  let cleaned = input.trim().replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+62")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("08")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

function normalizeUsername(input) {
  if (!input) return "";
  let val = input.trim().replace(/\/+$/, "");
  if (val.includes("instagram.com/")) {
    val = val.split("instagram.com/")[1].split(/[?#/]/)[0];
  } else if (val.includes("tiktok.com/@")) {
    val = val.split("tiktok.com/@")[1].split(/[?#/]/)[0];
  } else if (val.includes("tiktok.com/")) {
    val = val.split("tiktok.com/")[1].split(/[?#/]/)[0];
  }
  return val.replace(/^@+/, "").trim();
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateVCard(data) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.businessName}`,
    `ORG:${data.businessName}`,
    `TEL;TYPE=WORK,VOICE:+${data.phone}`,
    "END:VCARD",
  ];
  return lines.join("\r\n");
}

async function runSelfChecks() {
  console.log("🔍 Menjalankan Automated Self-Check Platform Kartu Bisnis...\n");

  // Test 1: Normalisasi WhatsApp
  console.log("1. Menguji normalisasi WhatsApp...");
  assert.strictEqual(normalizeWhatsApp("081234567890"), "6281234567890");
  assert.strictEqual(normalizeWhatsApp("+6281234567890"), "6281234567890");
  assert.strictEqual(normalizeWhatsApp("6281234567890"), "6281234567890");
  assert.strictEqual(normalizeWhatsApp("81234567890"), "6281234567890");
  assert.strictEqual(normalizeWhatsApp("0812-3456-7890"), "6281234567890");
  console.log("   ✅ Normalisasi WhatsApp lolos semua test case");

  // Test 2: Normalisasi Username Sosial Media
  console.log("2. Menguji normalisasi username IG / TikTok...");
  assert.strictEqual(normalizeUsername("@kopinusantara"), "kopinusantara");
  assert.strictEqual(normalizeUsername("https://instagram.com/kopinusantara?igsh=123"), "kopinusantara");
  assert.strictEqual(normalizeUsername("https://tiktok.com/@kopinusantara/"), "kopinusantara");
  console.log("   ✅ Normalisasi username lolos");

  // Test 3: Slug Generator
  console.log("3. Menguji slug generator...");
  assert.strictEqual(generateSlug("Kopi Nusantara Roastery"), "kopi-nusantara-roastery");
  assert.strictEqual(generateSlug("Toko Obat & Alkes #1"), "toko-obat-alkes-1");
  console.log("   ✅ Slug generator lolos");

  // Test 4: vCard Output
  console.log("4. Menguji generator vCard...");
  const vcf = generateVCard({ businessName: "Kopi Nusantara", phone: "6281234567890" });
  assert(vcf.startsWith("BEGIN:VCARD"));
  assert(vcf.includes("FN:Kopi Nusantara"));
  assert(vcf.endsWith("END:VCARD"));
  console.log("   ✅ Generator vCard format 3.0 valid");

  // Test 5: QR Code SVG & Buffer Generation
  console.log("5. Menguji generator QR Code...");
  const svg = await QRCode.toString("https://example.com/c/test", { type: "svg", errorCorrectionLevel: "H" });
  assert(svg.includes("<svg"));
  const buffer = await QRCode.toBuffer("https://example.com/c/test", { width: 1000 });
  assert(buffer instanceof Buffer && buffer.length > 500);
  console.log("   ✅ QR Code SVG & PNG high-res render valid");

  // Test 6: Password Hash & Verification
  console.log("6. Menguji enkripsi password...");
  const pass = "adminpassword123";
  const hash = await bcrypt.hash(pass, 10);
  assert(await bcrypt.compare(pass, hash));
  assert(!(await bcrypt.compare("wrongpass", hash)));
  console.log("   ✅ Password hashing & verification aman");

  // Test 7: Database Connection & Seed Data Verification
  console.log("7. Menguji query database & relasi data...");
  const prisma = new PrismaClient();
  try {
    const admin = await prisma.admin.findFirst();
    assert(admin, "Admin account harus ada di DB");

    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      include: { orders: true, _count: { select: { pageViews: true, linkClicks: true } } },
    });
    assert(customers.length >= 3, "Harus ada minimal 3 pelanggan seed");

    const orders = await prisma.order.findMany();
    assert(orders.length >= 5, "Harus ada minimal 5 pesanan seed");

    console.log(`   ✅ Database aktif: ${customers.length} pelanggan, ${orders.length} pesanan, Admin: ${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n🎉 SEMUA 7 SELF-CHECK LOLOS DENGAN SEMPURNA! Sistem siap dijalankan.");
}

runSelfChecks().catch((err) => {
  console.error("❌ Self-check failed:", err);
  process.exit(1);
});
