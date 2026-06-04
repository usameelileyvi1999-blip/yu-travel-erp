"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainMenu = [
  { key: "dashboard", label: "Dashboard", href: "/" },
  { key: "reservations", label: "Rezervasyon", href: "/reservations" },
  { key: "operations", label: "Operasyon", href: "/operations" },
  { key: "vouchers", label: "Voucher", href: "/vouchers" },
  { key: "reports", label: "Raporlar", href: "/reports" },
  { key: "accounting", label: "Muhasebe", href: "/accounting" },
  { key: "definitions", label: "Tanımlamalar", href: "/definitions" },
  { key: "settings", label: "Ayarlar", href: "/settings" },
];

const quickMenus: Record<string, { label: string; href: string }[]> = {
  dashboard: [
    { label: "Yeni Rezervasyon", href: "/reservations/new" },
    { label: "Bugünkü Gelişler", href: "/operations/arrival" },
    { label: "Bugünkü Dönüşler", href: "/operations/departure" },
    { label: "Voucher Yazdır", href: "/vouchers" },
  ],

  reservations: [
    { label: "Yeni Rezervasyon", href: "/reservations/new" },
    { label: "Rezervasyon Listesi", href: "/reservations" },
    { label: "Paket Rezervasyon", href: "/reservations/package" },
    { label: "Otel Rezervasyon", href: "/reservations/hotel" },
    { label: "Transfer Rezervasyon", href: "/reservations/transfer" },
    { label: "Tur Rezervasyon", href: "/reservations/tour" },
    { label: "Uçak Bileti", href: "/reservations/flight" },
  ],

  operations: [
    { label: "Operasyon Paneli", href: "/operations" },
    { label: "Geliş Operasyonu", href: "/operations/arrival" },
    { label: "Dönüş Operasyonu", href: "/operations/departure" },
    { label: "Otel Operasyonu", href: "/operations/hotel" },
    { label: "Tur Operasyonu", href: "/operations/tour" },
    { label: "Günlük İş Listesi", href: "/operations/daily" },
    { label: "Araç / Şoför Atama", href: "/operations/assignments" },
  ],

  vouchers: [
    { label: "Voucher Listesi", href: "/vouchers" },
    { label: "Voucher Yazdır", href: "/vouchers/print" },
    { label: "WhatsApp Voucher", href: "/vouchers/whatsapp" },
    { label: "PDF Voucher", href: "/vouchers/pdf" },
  ],

  reports: [
    { label: "Rapor Paneli", href: "/reports" },
    { label: "Geliş Raporu", href: "/reports/arrival" },
    { label: "Dönüş Raporu", href: "/reports/departure" },
    { label: "Otel Raporu", href: "/reports/hotel" },
    { label: "Tur Raporu", href: "/reports/tour" },
    { label: "Acenta Raporu", href: "/reports/agency" },
    { label: "Excel Aktar", href: "/reports/export" },
  ],

  accounting: [
    { label: "Muhasebe Paneli", href: "/accounting" },
    { label: "Gelirler", href: "/accounting/income" },
    { label: "Giderler", href: "/accounting/expenses" },
    { label: "Acenta Bakiyeleri", href: "/accounting/agencies" },
    { label: "Şoför Ödemeleri", href: "/accounting/drivers" },
    { label: "Cari Hareketler", href: "/accounting/transactions" },
  ],

  definitions: [
    { label: "Acenteler", href: "/definitions/agencies" },
    { label: "Oteller", href: "/definitions/hotels" },
    { label: "Bölgeler", href: "/definitions/regions" },
    { label: "Araç Tipleri", href: "/definitions/vehicle-types" },
    { label: "Araçlar", href: "/definitions/vehicles" },
    { label: "Şoförler", href: "/definitions/drivers" },
    { label: "Turlar", href: "/definitions/tours" },
    { label: "Ek Servisler", href: "/definitions/services" },
  ],

  settings: [
    { label: "Kullanıcılar", href: "/settings/users" },
    { label: "Firma Bilgileri", href: "/settings/company" },
    { label: "Voucher Ayarları", href: "/settings/voucher" },
    { label: "Tema Ayarları", href: "/settings/theme" },
  ],
};

function getActiveMainKey(pathname: string) {
  if (pathname === "/") return "dashboard";

  const activeItem = mainMenu.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );

  return activeItem?.key || "dashboard";
}

export default function TopMenu() {
  const pathname = usePathname();
  const activeMainKey = getActiveMainKey(pathname);
  const activeQuickMenu = quickMenus[activeMainKey] || quickMenus.dashboard;

  return (
    <header className="sejour-header">
      <div className="top-bar">
        <Link href="/" className="brand-box">
          <div className="brand-title">YU TRAVEL ERP</div>
          <div className="brand-subtitle">Incoming Agency System</div>
        </Link>

        <nav className="main-menu">
          {mainMenu.map((item) => {
            const isActive = item.key === activeMainKey;

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
        {activeQuickMenu.map((item) => {
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
