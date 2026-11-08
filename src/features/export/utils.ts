// Fungsi pembantu murni untuk fitur ekspor (tanpa dependensi, mudah dites).

export type ExportParams = {
  /** Tanggal awal transaksi, format YYYY-MM-DD. */
  from?: string;
  /** Tanggal akhir transaksi, format YYYY-MM-DD. */
  to?: string;
};

export const RANGE_ERROR_MESSAGE = "Tanggal awal tidak boleh setelah tanggal akhir";

const pad = (value: number) => String(value).padStart(2, "0");

/** Ubah karakter pemisah path agar nama berkas dari server tetap aman. */
const sanitizeFilename = (value: string) => {
  const cleaned = value.trim().replace(/[/\\]/g, "_");
  return cleaned.length > 0 ? cleaned : null;
};

/**
 * Ambil nama berkas dari header Content-Disposition.
 * Mendukung `filename*=UTF-8''...` (RFC 5987), `filename="..."`, dan `filename=...`.
 * Mengembalikan null jika header kosong atau tidak memuat nama berkas.
 */
export const parseContentDispositionFilename = (
  header: string | null | undefined,
): string | null => {
  if (!header) return null;

  const extended = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header);
  if (extended) {
    try {
      const decoded = sanitizeFilename(
        decodeURIComponent(extended[2].trim().replace(/^"|"$/g, "")),
      );
      if (decoded) return decoded;
    } catch {
      // Encoding rusak; lanjut ke bentuk `filename=`.
    }
  }

  const quoted = /filename\s*=\s*"((?:\\.|[^"\\])*)"/i.exec(header);
  if (quoted) return sanitizeFilename(quoted[1].replace(/\\(.)/g, "$1"));

  const bare = /filename\s*=\s*([^;]+)/i.exec(header);
  if (bare) return sanitizeFilename(bare[1]);

  return null;
};

/**
 * Bentuk query string untuk GET /export. Parameter hanya disertakan jika diisi.
 * Mengembalikan "" bila tidak ada parameter, atau "?from=...&to=...".
 */
export const buildExportQuery = ({ from, to }: ExportParams = {}) => {
  const params = new URLSearchParams();
  const fromValue = from?.trim();
  const toValue = to?.trim();
  if (fromValue) params.set("from", fromValue);
  if (toValue) params.set("to", toValue);
  const query = params.toString();
  return query ? `?${query}` : "";
};

/**
 * Nama berkas cadangan `duitku-export-YYYY-MM-DD.json` memakai komponen tanggal
 * lokal (bukan toISOString, yang berbasis UTC dan bisa bergeser satu hari).
 */
export const fallbackExportFilename = (date: Date = new Date()) =>
  `duitku-export-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;

/** true jika kedua tanggal diisi dan tanggal awal jatuh setelah tanggal akhir. */
export const isInvalidDateRange = (from?: string, to?: string) =>
  Boolean(from && to && from > to);

