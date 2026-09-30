import QRCode from "qrcode";

export interface QROptions {
  color?: {
    dark?: string;
    light?: string;
  };
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  width?: number;
}

export async function generateQRSVG(text: string, options?: QROptions): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: options?.errorCorrectionLevel || "H",
    margin: options?.margin ?? 2,
    color: {
      dark: options?.color?.dark || "#000000",
      light: options?.color?.light || "#ffffff",
    },
  });
}

export async function generateQRPNGDataUrl(text: string, options?: QROptions): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: options?.errorCorrectionLevel || "H",
    margin: options?.margin ?? 2,
    width: options?.width || 1000,
    color: {
      dark: options?.color?.dark || "#000000",
      light: options?.color?.light || "#ffffff",
    },
  });
}

export async function generateQRPNGBuffer(text: string, options?: QROptions): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: options?.errorCorrectionLevel || "H",
    margin: options?.margin ?? 2,
    width: options?.width || 1000,
    color: {
      dark: options?.color?.dark || "#000000",
      light: options?.color?.light || "#ffffff",
    },
  });
}
