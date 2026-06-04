"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainMenu = [
  { label: "Dashboard", href: "/" },
  { label: "Rezervasyon", href: "/reservations" },
  { label: "Operasyon", href: "/operations" },
  { label: "Voucher", href: "/vouchers" },
  { label: "Raporlar", href: "/reports" },
  { label: "Muhasebe", href: "/accounting" },
  { label: "Tanımlamalar", href: "/definitions" },
  { label: "Ayarlar", href: "/settings" },
];

const quickMenu = [
  { label: "Yeni Rezervasyon", href: "/reservations/new" },
  { label: "Rezervasyon Listesi", href: "/reservations" },
  { label: "Geliş Operasyonu", href: "/operations/arrival" },
  { label: "Dönüş Operasyonu", href: "/operations/departure" },
  { label: "Otel Operasyonu", href: "/operations/hotel" },
  { label: "Tur Operasyonu", href: "/operations/tour" },
  { label: "Voucher Yazdır", href: "/vouchers" },
];

export default function TopMenu() {
  const pathname = usePathname();

  return (
    <header className="sejour-header">
      <div className="top-bar">
        <div className="brand-box">
          <div className="brand-title">YU TRAVEL ERP</div>
          <div className="brand-subtitle">Incoming Agency System</div>
        </div>

        <nav className="main-menu">
          {mainMenu.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "main-menu-item active" : "main-menu-item"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="quick-bar">
        {quickMenu.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "quick-menu-item active" : "quick-menu-item"}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
