import Link from "next/link";
import { requireAdmin } from "../../lib/actions/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f5f1e8_0%,_#ffffff_100%)]">
      <header className="border-b border-black/10 bg-white/90">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-display text-2xl text-[#123524]">MetaEnergy Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/relationships">Relationships</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
