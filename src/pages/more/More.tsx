import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import {
  ChevronRight,
  Database,
  Download,
  FileBarChart,
  Info,
  LogOut,
  Moon,
  RefreshCcw,
  Sun,
  Tags,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ExportSection } from "@/features/export/ExportSection";
import {
  useCategories,
  useLogout,
  useMe,
  useTransactions,
  useWallets,
} from "@/hooks/use-finance";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { USE_MOCK } from "@/lib/api";
import { resetMockDB } from "@/lib/mock/data";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

function MorePage() {
  const navigate = useNavigate();
  const me = useMe();
  const wallets = useWallets();
  const categories = useCategories();
  const transactions = useTransactions({ limit: 1 });
  const logout = useLogout();
  const { resolvedTheme, setTheme } = useTheme();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [installing, setInstalling] = useState(false);
  const { canInstall, promptInstall } = usePwaInstall();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success("Kamu sudah keluar.");
      navigate({ to: "/masuk", replace: true });
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
    }
  };

  const handleReset = () => {
    setResetting(true);
    resetMockDB();
    window.location.reload();
  };

  const handleInstall = async () => {
    if (installing) return;
    setInstalling(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "accepted") {
        toast.success("Duitku berhasil dipasang.");
      } else if (outcome === "dismissed") {
        toast.info("Instalasi dibatalkan.");
      }
    } finally {
      setInstalling(false);
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-bold tracking-tight'>Lainnya</h1>
        <p className='text-xs text-muted-foreground'>Profil, preferensi, dan pengaturan</p>
      </div>

      <div className='flex items-center gap-3.5 rounded-2xl bg-gradient-to-br from-primary to-primary-container p-4 text-primary-foreground shadow-[0_10px_24px_-8px_rgba(79,70,229,0.4)]'>
        <Avatar size='lg' className='size-14 ring-2 ring-primary-foreground/30'>
          <AvatarFallback className='bg-primary-foreground/20 text-base font-bold text-primary-foreground'>
            {initials(me.data?.name)}
          </AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate text-base font-bold'>{me.data?.name ?? "Pengguna"}</span>
          <span className='truncate text-xs text-primary-foreground/80'>
            {me.data?.email ?? "-"}
          </span>
          <span className='mt-1 w-fit rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase'>
            {USE_MOCK ? "Mode demo" : "Akun aktif"}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2'>
        <StatPill
          icon={WalletCards}
          value={String(wallets.data?.length ?? 0)}
          label='Dompet'
        />
        <StatPill
          icon={FileBarChart}
          value={String(transactions.data?.total ?? 0)}
          label='Transaksi'
        />
        <StatPill
          icon={Tags}
          value={String(categories.data?.length ?? 0)}
          label='Kategori'
        />
      </div>

      <section className='flex flex-col gap-2'>
        <h2 className='px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase'>
          Laporan & Data
        </h2>
        <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
          <div className='divide-y divide-border/40'>
            <MenuLink to='/laporan' icon={FileBarChart} label='Laporan keuangan' description='Ringkasan bulanan dan tren' />
            <MenuLink to='/dompet' icon={WalletCards} label='Dompet' description='Kelola sumber dana' />
            <MenuLink to='/kategori' icon={Tags} label='Kategori' description='Atur kelompok transaksi' />
          </div>
        </div>
      </section>

      <ExportSection />

      <section className='flex flex-col gap-2'>
        <h2 className='px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase'>
          Preferensi
        </h2>
        <div className='flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'>
          <div className='flex items-center gap-3'>
            <span className='flex size-9 items-center justify-center rounded-full bg-surface-container text-foreground'>
              {isDark ? <Moon size={17} /> : <Sun size={17} />}
            </span>
            <div className='flex flex-col'>
              <span className='text-sm font-semibold'>Tampilan {isDark ? "gelap" : "terang"}</span>
              <span className='text-[10px] text-muted-foreground'>
                Ikuti preferensi perangkat atau ubah manual
              </span>
            </div>
          </div>
          <button
            type='button'
            role='switch'
            aria-checked={isDark}
            aria-label='Aktifkan mode gelap'
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "relative flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
              isDark ? "bg-primary" : "bg-surface-container-highest",
            )}
          >
            <span
              className={cn(
                "size-5 rounded-full bg-white shadow-sm transition-transform",
                isDark && "translate-x-5",
              )}
            />
          </button>
        </div>

        {canInstall && (
          <button
            type='button'
            onClick={handleInstall}
            disabled={installing}
            className='flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 text-left ring-1 ring-border/50 transition-colors hover:bg-surface-container-low/50 disabled:opacity-60'
          >
            <div className='flex items-center gap-3'>
              <span className='flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <Download size={17} />
              </span>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold'>Instal aplikasi</span>
                <span className='text-[10px] text-muted-foreground'>
                  {installing
                    ? "Menyiapkan instalasi..."
                    : "Pasang Duitku di layar utama, akses lebih cepat"}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className='shrink-0 text-muted-foreground' />
          </button>
        )}

        <div className='flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'>
          <div className='flex items-center gap-3'>
            <span className='flex size-9 items-center justify-center rounded-full bg-surface-container text-foreground'>
              <Database size={17} />
            </span>
            <div className='flex flex-col'>
              <span className='text-sm font-semibold'>Penyimpanan data</span>
              <span className='text-[10px] text-muted-foreground'>
                {USE_MOCK
                  ? "Mock lokal di browser (localStorage)"
                  : "Terhubung ke API Duitku"}
              </span>
            </div>
          </div>
          <span className='rounded-full bg-secondary/10 px-2 py-1 text-[9px] font-bold text-secondary'>
            {USE_MOCK ? "LOKAL" : "API"}
          </span>
        </div>

        {USE_MOCK && (
          <button
            type='button'
            onClick={handleReset}
            disabled={resetting}
            className='flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 text-left ring-1 ring-border/50 transition-colors hover:bg-surface-container-low/50'
          >
            <div className='flex items-center gap-3'>
              <span className='flex size-9 items-center justify-center rounded-full bg-surface-container text-foreground'>
                <RefreshCcw size={17} />
              </span>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold'>Reset data demo</span>
                <span className='text-[10px] text-muted-foreground'>
                  Kembalikan data contoh ke kondisi awal
                </span>
              </div>
            </div>
            <ChevronRight size={16} className='text-muted-foreground' />
          </button>
        )}
      </section>

      <section className='flex flex-col gap-2'>
        <h2 className='px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase'>
          Tentang
        </h2>
        <div className='flex flex-col gap-2 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'>
          <div className='flex items-center gap-2 text-sm font-semibold'>
            <Info size={15} className='text-primary' />
            Duitku
          </div>
          <p className='text-[11px] leading-relaxed text-muted-foreground'>
            Aplikasi pencatat keuangan pribadi. Catat pemasukan dan pengeluaran, kelola
            dompet, atur budget, dan pantau laporan dalam satu tempat.
          </p>
          <span className='text-[10px] text-muted-foreground'>Versi 1.0.0</span>
        </div>
      </section>

      <Button
        type='button'
        variant='destructive'
        className='h-11 rounded-xl'
        onClick={() => setLogoutOpen(true)}
      >
        <LogOut size={16} />
        Keluar dari akun
      </Button>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari Duitku?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu perlu masuk kembali untuk melihat data keuanganmu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              {logout.isPending ? "Keluar..." : "Keluar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof WalletCards;
  value: string;
  label: string;
}) {
  return (
    <div className='flex flex-col items-center gap-1 rounded-2xl bg-surface-container-lowest py-3 ring-1 ring-border/50'>
      <Icon size={17} className='text-primary' />
      <span className='text-base font-bold tabular-nums'>{value}</span>
      <span className='text-[10px] text-muted-foreground'>{label}</span>
    </div>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  description,
}: {
  to: "/laporan" | "/dompet" | "/kategori";
  icon: typeof WalletCards;
  label: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className='flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container-low'
    >
      <div className='flex min-w-0 items-center gap-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-foreground'>
          <Icon size={17} />
        </span>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate text-sm font-semibold'>{label}</span>
          <span className='truncate text-[10px] text-muted-foreground'>{description}</span>
        </div>
      </div>
      <ChevronRight size={16} className='shrink-0 text-muted-foreground' />
    </Link>
  );
}

export default MorePage;
