/**
 * Normalisasi dan sanitasi input sesuai PRD Section 6.3
 */

// Normalisasi nomor WhatsApp ke format internasional 628xxxx
export function normalizeWhatsApp(input: string): string {
  if (!input) return "";
  // Buang semua karakter non-digit kecuali tanda plus
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

// Normalisasi username Instagram / TikTok (buang @ dan URL)
export function normalizeUsername(input?: string | null): string {
  if (!input) return "";
  let val = input.trim();

  // Hapus trailing slash
  val = val.replace(/\/+$/, "");

  // Jika berupa URL
  try {
    if (val.includes("instagram.com/")) {
      const parts = val.split("instagram.com/");
      val = parts[1].split(/[?#/]/)[0];
    } else if (val.includes("tiktok.com/@")) {
      const parts = val.split("tiktok.com/@");
      val = parts[1].split(/[?#/]/)[0];
    } else if (val.includes("tiktok.com/")) {
      const parts = val.split("tiktok.com/");
      val = parts[1].split(/[?#/]/)[0];
    }
  } catch {
    // fallback
  }

  // Hapus karakter @ di depan jika ada
  val = val.replace(/^@+/, "");
  // Ambil hanya karakter valid untuk username
  return val.trim();
}

// Normalisasi URL Website
export function normalizeWebsiteUrl(input?: string | null): string {
  if (!input) return "";
  let val = input.trim();
  if (!val) return "";

  if (!val.startsWith("http://") && !val.startsWith("https://")) {
    val = "https://" + val;
  }
  return val;
}

// Normalisasi URL Facebook
export function normalizeFacebookUrl(input?: string | null): string {
  if (!input) return "";
  let val = input.trim();
  if (!val) return "";

  if (!val.startsWith("http://") && !val.startsWith("https://")) {
    val = "https://" + val;
  } else if (val.startsWith("http://")) {
    val = "https://" + val.substring(7);
  }
  return val;
}

// Normalisasi URL LinkedIn
export function normalizeLinkedinUrl(input?: string | null): string {
  if (!input) return "";
  let val = input.trim();
  if (!val) return "";

  if (!val.startsWith("http://") && !val.startsWith("https://")) {
    if (val.startsWith("linkedin.com") || val.startsWith("www.linkedin.com")) {
      val = "https://" + val;
    } else {
      val = "https://linkedin.com/in/" + val.replace(/^@+/, "");
    }
  }
  return val;
}

// Format slug ramah URL
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Hapus karakter non-alphanumeric selain spasi dan dash
    .replace(/[\s_-]+/g, "-")  // Ganti spasi & underscore dengan dash tunggal
    .replace(/^-+|-+$/g, "");  // Hapus dash di awal dan akhir
}

// Format Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
