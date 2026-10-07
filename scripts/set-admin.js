const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];

  if (!email || !password) {
    console.log(`
ℹ️  Penggunaan:
   node scripts/set-admin.js <email> <password>

Contoh:
   node scripts/set-admin.js fadhir@tautsmart.com Rahasia1234
    `);
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌ Password minimal harus 6 karakter.");
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  // Cari admin pertama atau berdasarkan email
  const existingAdmin = await prisma.admin.findFirst();

  let admin;
  if (existingAdmin) {
    admin = await prisma.admin.update({
      where: { id: existingAdmin.id },
      data: {
        email: cleanEmail,
        passwordHash,
      },
    });
    console.log(`✅ Akun admin berhasil diperbarui!`);
  } else {
    admin = await prisma.admin.create({
      data: {
        email: cleanEmail,
        passwordHash,
      },
    });
    console.log(`✅ Akun admin baru berhasil dibuat!`);
  }

  console.log(`📧 Email    : ${admin.email}`);
  console.log(`🔑 Password : (tersimpan dengan aman)`);
  console.log(`\nSilakan masuk di http://localhost:3000/admin/login`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal memperbarui admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
