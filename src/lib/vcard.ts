export interface VCardData {
  businessName: string;
  ownerName?: string | null;
  jobTitle?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  tagline?: string | null;
  url?: string | null;
  website?: string | null;
}

export function generateVCard(data: VCardData): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${(data.ownerName || data.businessName).replace(/\n/g, " ")}`,
    `ORG:${data.businessName.replace(/\n/g, " ")}`,
  ];

  if (data.jobTitle) {
    lines.push(`TITLE:${data.jobTitle.replace(/\n/g, " ")}`);
  }

  if (data.ownerName) {
    lines.push(`N:;${data.ownerName.replace(/\n/g, " ")};;;`);
  } else {
    lines.push(`N:;${data.businessName.replace(/\n/g, " ")};;;`);
  }

  if (data.phone) {
    const formattedPhone = data.phone.startsWith("+") ? data.phone : `+${data.phone}`;
    lines.push(`TEL;TYPE=CELL,VOICE:${formattedPhone}`);
  }

  if (data.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${data.email.trim()}`);
  }

  if (data.address || data.city) {
    const cleanAddr = (data.address || data.city || "").replace(/\r?\n/g, ", ");
    lines.push(`ADR;TYPE=WORK:;;${cleanAddr};${data.city || ""};;;ID`);
    lines.push(`LABEL;TYPE=WORK:${cleanAddr}`);
  }

  if (data.tagline) {
    lines.push(`NOTE:${data.tagline.replace(/\r?\n/g, " ")}`);
  }

  if (data.website) {
    lines.push(`URL;TYPE=WORK:${data.website}`);
  } else if (data.url) {
    lines.push(`URL:${data.url}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}
