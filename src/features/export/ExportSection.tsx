import { useId, useState, type FormEvent } from "react";
import { AlertCircle, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiError } from "@/lib/api";
import { useExportMutation } from "./hooks";
import { isInvalidDateRange, RANGE_ERROR_MESSAGE, type ExportParams } from "./utils";

const describeExportError = (error: unknown) => {
  const apiError = getApiError(error);
  if (apiError.code === "ERR_NETWORK") {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.";
  }
  if (apiError.code === "ECONNABORTED" || apiError.code === "ETIMEDOUT") {
    return "Server terlalu lama merespons. Silakan coba lagi.";
  }
  if (apiError.status === 401) {
    return "Sesi Anda telah berakhir. Silakan masuk kembali untuk mengunduh data.";
  }
  if (apiError.status >= 500) {
    return "Server sedang bermasalah sehingga data belum bisa disiapkan. Silakan coba beberapa saat lagi.";
  }
  return apiError.message || "Terjadi kesalahan saat mengunduh data.";
};

export function ExportSection() {
  const ids = {
    heading: useId(),
    from: useId(),
    to: useId(),
    hint: useId(),
    rangeError: useId(),
  };
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const exportMutation = useExportMutation();
  const isPending = exportMutation.isPending;

  const runExport = (params: ExportParams) => {
    exportMutation.mutate(params, {
      onSuccess: () => toast.success("Data berhasil diunduh"),
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    if (isInvalidDateRange(from, to)) {
      setRangeError(RANGE_ERROR_MESSAGE);
      return;
    }
    setRangeError(null);
    runExport({ from: from || undefined, to: to || undefined });
  };

  const handleRetry = () => {
    if (isPending) return;
    runExport(exportMutation.variables ?? {});
  };

  const describedBy = rangeError ? `${ids.hint} ${ids.rangeError}` : ids.hint;

  return (
    <section aria-labelledby={ids.heading} className='flex flex-col gap-2'>
      <h2
        id={ids.heading}
        className='px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase'
      >
        Ekspor data
      </h2>
      <form
        noValidate
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'
      >
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Unduh seluruh data Anda sebagai berkas JSON untuk dipindahkan ke aplikasi mobile
        </p>

        <fieldset className='flex flex-col gap-2' disabled={isPending}>
          <legend className='sr-only'>Rentang tanggal transaksi (opsional)</legend>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor={ids.from}>Dari</Label>
              <Input
                id={ids.from}
                type='date'
                value={from}
                max={to || undefined}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setRangeError(null);
                }}
                aria-invalid={Boolean(rangeError)}
                aria-describedby={describedBy}
                className='h-11 rounded-xl'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor={ids.to}>Sampai</Label>
              <Input
                id={ids.to}
                type='date'
                value={to}
                min={from || undefined}
                onChange={(event) => {
                  setTo(event.target.value);
                  setRangeError(null);
                }}
                aria-invalid={Boolean(rangeError)}
                aria-describedby={describedBy}
                className='h-11 rounded-xl'
              />
            </div>
          </div>
          <p id={ids.hint} className='text-[11px] text-muted-foreground'>
            Opsional. Rentang tanggal hanya berlaku untuk transaksi; kosongkan untuk
            mengekspor semuanya.
          </p>
          {rangeError && (
            <p id={ids.rangeError} role='alert' className='text-xs font-medium text-destructive'>
              {rangeError}
            </p>
          )}
        </fieldset>

        {exportMutation.isError && !isPending && (
          <div
            role='alert'
            className='flex flex-col gap-3 rounded-xl bg-destructive/10 p-3 text-destructive dark:bg-destructive/20'
          >
            <div className='flex items-start gap-2'>
              <AlertCircle size={16} className='mt-0.5 shrink-0' aria-hidden='true' />
              <div className='flex flex-col gap-0.5'>
                <span className='text-sm font-semibold'>Gagal mengunduh data</span>
                <span className='text-xs leading-relaxed'>
                  {describeExportError(exportMutation.error)}
                </span>
              </div>
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={handleRetry}
              className='h-11 rounded-xl'
            >
              <RotateCcw size={16} aria-hidden='true' />
              Coba lagi
            </Button>
          </div>
        )}

        <Button
          type='submit'
          disabled={isPending}
          aria-busy={isPending}
          className='h-11 rounded-xl'
        >
          <Download size={16} aria-hidden='true' />
          {isPending ? "Menyiapkan..." : "Unduh data"}
        </Button>
      </form>
    </section>
  );
}
