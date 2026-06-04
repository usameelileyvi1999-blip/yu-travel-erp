import Link from "next/link";
import ReservationWorkspace from "@/components/ReservationWorkspace";
import Link from "next/link";

type PageConfig = {
  title: string;
  subtitle: string;
  type: "dashboard" | "reservation" | "operation" | "voucher" | "report" | "accounting" | "definition" | "settings";
};

const pages: Record<string, PageConfig> = {
  "/reservations": {
    title: "Rezervasyon Listesi",
    subtitle: "Tüm rezervasyonları listele, ara, düzenle ve voucher oluştur.",
    type: "reservation",
  },
  "/reservations/new": {
    title: "Yeni Rezervasyon",
    subtitle: "Otel, transfer, tur, uçak bileti ve ek servisleri tek rezervasyonda oluştur.",
    type: "reservation",
  },
  "/reservations/package": {
    title: "Paket Rezervasyon",
    subtitle: "Otel + transfer + tur + uçak bileti kombinasyonlu paket rezervasyon oluştur.",
    type: "reservation",
  },
  "/reservations/hotel": {
    title: "Otel Rezervasyon",
    subtitle: "Otel giriş, çıkış, oda tipi, pansiyon ve misafir bilgilerini yönet.",
    type: "reservation",
  },
  "/reservations/transfer": {
    title: "Transfer Rezervasyon",
    subtitle: "Geliş ve dönüş transferlerini tek rezervasyon altında planla.",
    type: "reservation",
  },
  "/reservations/tour": {
    title: "Tur Rezervasyon",
    subtitle: "Günlük tur, özel tur ve rehberli tur rezervasyonlarını oluştur.",
    type: "reservation",
  },
  "/reservations/flight": {
    title: "Uçak Bileti",
    subtitle: "PNR, uçuş saati, havayolu ve yolcu bilet bilgilerini takip et.",
    type: "reservation",
  },

  "/operations": {
    title: "Operasyon Paneli",
    subtitle: "Günlük geliş, dönüş, otel, tur ve araç/şoför operasyonlarını takip et.",
    type: "operation",
  },
  "/operations/arrival": {
    title: "Geliş Operasyonu",
    subtitle: "Havalimanı karşılama, araç, şoför, uçuş ve otel transfer takibi.",
    type: "operation",
  },
  "/operations/departure": {
    title: "Dönüş Operasyonu",
    subtitle: "Otel çıkış, havalimanı bırakış, araç ve şoför planlaması.",
    type: "operation",
  },
  "/operations/hotel": {
    title: "Otel Operasyonu",
    subtitle: "Check-in, check-out, oda bilgisi ve otel notlarını takip et.",
    type: "operation",
  },
  "/operations/tour": {
    title: "Tur Operasyonu",
    subtitle: "Günlük tur listesi, araç, rehber, saat ve pax takibi.",
    type: "operation",
  },
  "/operations/daily": {
    title: "Günlük İş Listesi",
    subtitle: "Bugünün tüm operasyon işlerini tek ekranda takip et.",
    type: "operation",
  },
  "/operations/assignments": {
    title: "Araç / Şoför Atama",
    subtitle: "Transfer ve tur operasyonlarına araç ve şoför ataması yap.",
    type: "operation",
  },

  "/vouchers": {
    title: "Voucher Listesi",
    subtitle: "Rezervasyonlara ait voucher belgelerini görüntüle ve yazdır.",
    type: "voucher",
  },
  "/vouchers/print": {
    title: "Voucher Yazdır",
    subtitle: "Müşteriye verilecek tek voucher belgesini hazırla.",
    type: "voucher",
  },
  "/vouchers/whatsapp": {
    title: "WhatsApp Voucher",
    subtitle: "Voucher içeriğini WhatsApp mesajı formatında oluştur.",
    type: "voucher",
  },
  "/vouchers/pdf": {
    title: "PDF Voucher",
    subtitle: "Voucher belgesini PDF olarak dışa aktar.",
    type: "voucher",
  },

  "/reports": {
    title: "Rapor Paneli",
    subtitle: "Rezervasyon, operasyon, acente ve gelir-gider raporlarını görüntüle.",
    type: "report",
  },
  "/reports/arrival": {
    title: "Geliş Raporu",
    subtitle: "Tarih bazlı geliş transfer raporu oluştur.",
    type: "report",
  },
  "/reports/departure": {
    title: "Dönüş Raporu",
    subtitle: "Tarih bazlı dönüş transfer raporu oluştur.",
    type: "report",
  },
  "/reports/hotel": {
    title: "Otel Raporu",
    subtitle: "Otel giriş, çıkış ve konaklama raporlarını görüntüle.",
    type: "report",
  },
  "/reports/tour": {
    title: "Tur Raporu",
    subtitle: "Tur satışları ve operasyon raporlarını görüntüle.",
    type: "report",
  },
  "/reports/agency": {
    title: "Acenta Raporu",
    subtitle: "Acentelere göre rezervasyon, satış ve bakiye raporları.",
    type: "report",
  },
  "/reports/export": {
    title: "Excel Aktar",
    subtitle: "Seçili raporları Excel formatında dışa aktar.",
    type: "report",
  },

  "/accounting": {
    title: "Muhasebe Paneli",
    subtitle: "Gelir, gider, acente bakiyesi ve cari hareketleri takip et.",
    type: "accounting",
  },
  "/accounting/income": {
    title: "Gelirler",
    subtitle: "Rezervasyon ve hizmet gelirlerini listele.",
    type: "accounting",
  },
  "/accounting/expenses": {
    title: "Giderler",
    subtitle: "Araç, şoför, otel, tur ve genel giderleri takip et.",
    type: "accounting",
  },
  "/accounting/agencies": {
    title: "Acenta Bakiyeleri",
    subtitle: "Acentelerin borç, alacak ve bakiye durumunu görüntüle.",
    type: "accounting",
  },
  "/accounting/drivers": {
    title: "Şoför Ödemeleri",
    subtitle: "Şoförlere ait operasyon ve ödeme takibini yap.",
    type: "accounting",
  },
  "/accounting/transactions": {
    title: "Cari Hareketler",
    subtitle: "Tüm finansal hareketleri tarih bazlı takip et.",
    type: "accounting",
  },

  "/definitions": {
    title: "Tanımlamalar",
    subtitle: "Sistemin temel kartlarını ve sabit verilerini yönet.",
    type: "definition",
  },
  "/definitions/agencies": {
    title: "Acenteler",
    subtitle: "Acenta kartları, iletişim bilgileri ve çalışma koşulları.",
    type: "definition",
  },
  "/definitions/hotels": {
    title: "Oteller",
    subtitle: "Otel kartları, bölge, oda tipi ve iletişim bilgileri.",
    type: "definition",
  },
  "/definitions/regions": {
    title: "Bölgeler",
    subtitle: "Antalya, Lara, Kundu, Belek, Side, Alanya gibi bölgeleri tanımla.",
    type: "definition",
  },
  "/definitions/vehicle-types": {
    title: "Araç Tipleri",
    subtitle: "Vito, Sprinter, VIP, Sedan, Otobüs gibi araç tiplerini yönet.",
    type: "definition",
  },
  "/definitions/vehicles": {
    title: "Araçlar",
    subtitle: "Plaka, marka, model, kapasite ve araç durumu bilgileri.",
    type: "definition",
  },
  "/definitions/drivers": {
    title: "Şoförler",
    subtitle: "Şoför kartları, telefon, araç ilişkisi ve ödeme bilgileri.",
    type: "definition",
  },
  "/definitions/tours": {
    title: "Turlar",
    subtitle: "Şehir turu, tekne turu, rafting, aquapark ve özel tur tanımları.",
    type: "definition",
  },
  "/definitions/services": {
    title: "Ek Servisler",
    subtitle: "VIP karşılama, bebek koltuğu, özel rehber, ekstra bagaj gibi hizmetler.",
    type: "definition",
  },

  "/settings": {
    title: "Ayarlar",
    subtitle: "Kullanıcı, firma, tema ve voucher ayarlarını yönet.",
    type: "settings",
  },
  "/settings/users": {
    title: "Kullanıcılar",
    subtitle: "Sistemi kullanacak personel hesaplarını yönet.",
    type: "settings",
  },
  "/settings/company": {
    title: "Firma Bilgileri",
    subtitle: "YU Travel firma adı, iletişim, adres ve logo bilgileri.",
    type: "settings",
  },
  "/settings/voucher": {
    title: "Voucher Ayarları",
    subtitle: "Voucher tasarımı, numara formatı ve belge ayarları.",
    type: "settings",
  },
  "/settings/theme": {
    title: "Tema Ayarları",
    subtitle: "Renk, görünüm ve panel tasarım ayarları.",
    type: "settings",
  },
};

function getColumns(type: PageConfig["type"]) {
  if (type === "reservation") {
    return ["Voucher No", "Misafir", "Acenta", "Giriş", "Çıkış", "Hizmetler", "Durum"];
  }

  if (type === "operation") {
    return ["Tarih", "Saat", "Misafir", "Hizmet", "Araç", "Şoför", "Durum"];
  }

  if (type === "voucher") {
    return ["Voucher No", "Misafir", "Hizmetler", "Oluşturma", "PDF", "WhatsApp", "Durum"];
  }

  if (type === "report") {
    return ["Tarih", "Rapor Türü", "Kayıt Sayısı", "Acenta", "Toplam", "Excel", "PDF"];
  }

  if (type === "accounting") {
    return ["Tarih", "Cari", "Açıklama", "Gelir", "Gider", "Bakiye", "Durum"];
  }

  if (type === "definition") {
    return ["Kod", "Ad", "Kategori", "Telefon", "Bölge", "Durum", "İşlem"];
  }

  return ["Ayar", "Açıklama", "Durum", "Güncelleme", "Yetki", "Kullanıcı", "İşlem"];
}

function getActions(type: PageConfig["type"]) {
  if (type === "reservation") {
    return ["Yeni Kayıt", "Düzenle", "Voucher Oluştur", "Operasyona Aktar", "Excel"];
  }

  if (type === "operation") {
    return ["Araç Ata", "Şoför Ata", "Durum Güncelle", "Günlük Liste", "Excel"];
  }

  if (type === "voucher") {
    return ["PDF Oluştur", "WhatsApp Metni", "Yazdır", "Önizle", "Arşiv"];
  }

  if (type === "report") {
    return ["Filtrele", "Excel Aktar", "PDF Aktar", "Yazdır", "Temizle"];
  }

  if (type === "accounting") {
    return ["Gelir Ekle", "Gider Ekle", "Cari Hareket", "Bakiye Raporu", "Excel"];
  }

  if (type === "definition") {
    return ["Yeni Tanım", "Düzenle", "Pasifleştir", "Excel", "Sil"];
  }

  return ["Kaydet", "Güncelle", "Yetki Ver", "Tema Değiştir", "Sıfırla"];
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const path = "/" + (resolvedParams.slug || []).join("/");
  const page = pages[path] || {
    title: "Modül Sayfası",
    subtitle: "Bu modül için sayfa hazırlandı.",
    type: "dashboard" as const,
  };
  if (path === "/reservations/new") {
    return <ReservationWorkspace mode="new" />;
  }

  if (path === "/reservations") {
    return <ReservationWorkspace mode="list" />;
  }

  if (path === "/operations/arrival") {
    return <ReservationWorkspace mode="arrival" />;
  }

  if (path === "/operations/departure") {
    return <ReservationWorkspace mode="departure" />;
  }

  if (path === "/operations/hotel") {
    return <ReservationWorkspace mode="hotel" />;
  }

  if (path === "/operations/tour") {
    return <ReservationWorkspace mode="tour" />;
  }

  if (path === "/vouchers") {
    return <ReservationWorkspace mode="voucher" />;
  }
  const columns = getColumns(page.type);
  const actions = getActions(page.type);

  return (
    <div className="module-page">
      <div className="page-title-bar">
        <h1>{page.title}</h1>
        <span>{page.subtitle}</span>
      </div>

      <div className="sejour-toolbar">
        {actions.map((action) => (
          <button key={action} className="sejour-action-button">
            {action}
          </button>
        ))}
      </div>

      <div className="sejour-filter-panel">
        <div className="filter-group">
          <label>Başlangıç Tarihi</label>
          <input type="date" />
        </div>

        <div className="filter-group">
          <label>Bitiş Tarihi</label>
          <input type="date" />
        </div>

        <div className="filter-group">
          <label>Arama</label>
          <input type="text" placeholder="Misafir, voucher, acenta..." />
        </div>

        <div className="filter-group">
          <label>Durum</label>
          <select>
            <option>Tümü</option>
            <option>Beklemede</option>
            <option>Onaylandı</option>
            <option>Operasyonda</option>
            <option>Tamamlandı</option>
            <option>İptal</option>
          </select>
        </div>

        <button className="filter-button">Listele</button>
      </div>

      <div className="sejour-table-card">
        <div className="table-header">
          <strong>{page.title}</strong>
          <span>Sejour tarzı liste ekranı</span>
        </div>

        <div className="table-wrapper">
          <table className="sejour-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                {columns.map((column, index) => (
                  <td key={column}>
                    {index === 0
                      ? "YU-0001"
                      : index === 1
                      ? "Örnek kayıt"
                      : "-"}
                  </td>
                ))}
              </tr>

              <tr>
                {columns.map((column, index) => (
                  <td key={column}>
                    {index === 0
                      ? "YU-0002"
                      : index === 1
                      ? "Demo kayıt"
                      : "-"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {page.type === "reservation" && (
        <div className="workflow-box">
          <h3>Rezervasyon Akışı</h3>
          <div className="workflow-steps">
            <span>1. Misafir</span>
            <span>2. Hizmet Seçimi</span>
            <span>3. Otel / Transfer / Tur / Uçak</span>
            <span>4. Tek Voucher</span>
            <span>5. Ayrı Operasyon</span>
          </div>
          <Link href="/reservations/new" className="workflow-link">
            Yeni rezervasyon oluşturmaya başla
          </Link>
        </div>
      )}

      {page.type === "operation" && (
        <div className="workflow-box">
          <h3>Operasyon Mantığı</h3>
          <div className="workflow-steps">
            <span>Geliş</span>
            <span>Dönüş</span>
            <span>Otel</span>
            <span>Tur</span>
            <span>Araç / Şoför</span>
          </div>
          <p>
            Her rezervasyon tek voucher olarak kalır; ancak içindeki hizmetler
            operasyon ekranına ayrı iş olarak düşer.
          </p>
        </div>
      )}
    </div>
  );
}
