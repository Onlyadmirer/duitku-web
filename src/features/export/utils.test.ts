import { describe, expect, it } from "vitest";
import {
  buildExportQuery,
  fallbackExportFilename,
  isInvalidDateRange,
  parseContentDispositionFilename,
} from "./utils";

describe("parseContentDispositionFilename", () => {
  it("membaca filename bertanda kutip", () => {
    expect(
      parseContentDispositionFilename('attachment; filename="duitku-export-2026-11-08.json"'),
    ).toBe("duitku-export-2026-11-08.json");
  });

  it("membaca filename tanpa tanda kutip", () => {
    expect(parseContentDispositionFilename("attachment; filename=data.json")).toBe("data.json");
  });

  it("membaca filename tanpa tanda kutip yang diikuti parameter lain", () => {
    expect(parseContentDispositionFilename("attachment; filename=data.json; size=10")).toBe(
      "data.json",
    );
  });

  it("mempertahankan spasi dan titik koma di dalam tanda kutip", () => {
    expect(parseContentDispositionFilename('attachment; filename="data saya; v2.json"')).toBe(
      "data saya; v2.json",
    );
  });

  it("mengutamakan filename* (RFC 5987) bila ada", () => {
    expect(
      parseContentDispositionFilename(
        "attachment; filename=\"fallback.json\"; filename*=UTF-8''ekspor%20duitku.json",
      ),
    ).toBe("ekspor duitku.json");
  });

  it("tidak peka huruf besar/kecil pada nama parameter", () => {
    expect(parseContentDispositionFilename('attachment; FILENAME="data.json"')).toBe("data.json");
  });

  it("mengganti pemisah path agar nama berkas aman", () => {
    expect(parseContentDispositionFilename('attachment; filename="../etc/data.json"')).toBe(
      ".._etc_data.json",
    );
  });

  it("mengembalikan null untuk header null, undefined, atau kosong", () => {
    expect(parseContentDispositionFilename(null)).toBeNull();
    expect(parseContentDispositionFilename(undefined)).toBeNull();
    expect(parseContentDispositionFilename("")).toBeNull();
  });

  it("mengembalikan null bila header tidak memuat filename", () => {
    expect(parseContentDispositionFilename("attachment")).toBeNull();
    expect(parseContentDispositionFilename('attachment; filename=""')).toBeNull();
  });
});

describe("buildExportQuery", () => {
  it("mengembalikan string kosong tanpa parameter", () => {
    expect(buildExportQuery()).toBe("");
    expect(buildExportQuery({})).toBe("");
  });

  it("mengabaikan nilai kosong atau hanya spasi", () => {
    expect(buildExportQuery({ from: "", to: "  " })).toBe("");
  });

  it("hanya menyertakan from bila hanya from diisi", () => {
    expect(buildExportQuery({ from: "2026-01-01" })).toBe("?from=2026-01-01");
  });

  it("hanya menyertakan to bila hanya to diisi", () => {
    expect(buildExportQuery({ to: "2026-01-31" })).toBe("?to=2026-01-31");
  });

  it("menyertakan from dan to bila keduanya diisi", () => {
    expect(buildExportQuery({ from: "2026-01-01", to: "2026-01-31" })).toBe(
      "?from=2026-01-01&to=2026-01-31",
    );
  });
});

describe("fallbackExportFilename", () => {
  it("memakai komponen tanggal lokal", () => {
    expect(fallbackExportFilename(new Date(2026, 10, 8, 0, 30))).toBe(
      "duitku-export-2026-11-08.json",
    );
  });

  it("menambahkan nol di depan bulan dan tanggal satu digit", () => {
    expect(fallbackExportFilename(new Date(2026, 0, 5, 23, 59))).toBe(
      "duitku-export-2026-01-05.json",
    );
  });
});

describe("isInvalidDateRange", () => {
  it("menolak from setelah to", () => {
    expect(isInvalidDateRange("2026-02-01", "2026-01-31")).toBe(true);
  });

  it("menerima tanggal yang sama, urutan benar, atau salah satu kosong", () => {
    expect(isInvalidDateRange("2026-01-31", "2026-01-31")).toBe(false);
    expect(isInvalidDateRange("2026-01-01", "2026-01-31")).toBe(false);
    expect(isInvalidDateRange("2026-01-01", "")).toBe(false);
    expect(isInvalidDateRange(undefined, "2026-01-01")).toBe(false);
  });
});
