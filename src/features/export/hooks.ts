import { useMutation } from "@tanstack/react-query";
import { downloadExport } from "./api";
import type { ExportParams } from "./utils";

/** Ekspor hanya membaca data, jadi tidak ada query yang perlu di-invalidate. */
export const useExportMutation = () =>
  useMutation({
    mutationFn: (params: ExportParams) => downloadExport(params),
  });

