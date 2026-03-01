import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/referrals", label: "Referrals" },
  { href: "/dashboard/points", label: "Points" },
  { href: "/admin/orders", label: "Admin" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-5">
        <Link href="/" className="font-display text-2xl text-[#123524]">
          元象能量会员系统
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-jade">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-full bg-[#123524] px-4 py-2 text-white">
            Member Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
