import { ApiError, apiFetch } from "@/lib/api";
import type { ApiErrorBody } from "@/types/api";
import {
  buildExportQuery,
  fallbackExportFilename,
  parseContentDispositionFilename,
  type ExportParams,
} from "./utils";

/** Picu unduhan berkas di browser lewat <a download> dan object URL. */
const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
};

/**
 * Unduh seluruh data pengguna sebagai berkas JSON dari GET /export.
 *
 * Memakai pembungkus fetch (`apiFetch`) yang berbagi interceptor 401 dan satu
 * promise refresh bersama (`credentials: "include"`). Respons ok diunduh sebagai
 * Blob lewat `<a download>` lalu `URL.revokeObjectURL`. Respons tidak ok dibaca
 * sebagai `{ error: { code, message } }` dan dilempar sebagai `ApiError`.
 */
export const downloadExport = async (params: ExportParams = {}) => {
  const response = await apiFetch(`/export${buildExportQuery(params)}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // Body bukan JSON; pakai pesan bawaan di bawah.
    }
    throw new ApiError(
      body?.error?.message ?? "Gagal mengunduh data ekspor",
      body?.error?.code ?? "EXPORT_FAILED",
      response.status,
      body?.error?.fields,
    );
  }

  const blob = await response.blob();
  const header = response.headers.get("Content-Disposition");
  const filename = parseContentDispositionFilename(header) ?? fallbackExportFilename();

  saveBlob(blob, filename);
  return { filename };
};
