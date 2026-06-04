export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-title-bar">
        <h1>YU Travel ERP</h1>
        <span>Rezervasyon ve Operasyon Paneli</span>
      </div>

      <div className="module-grid">
        <a href="/reservations/new" className="module-card">
          <div className="module-icon">📋</div>
          <div>
            <h3>Yeni Rezervasyon</h3>
            <p>Otel, transfer, tur ve uçak hizmeti ekle</p>
          </div>
        </a>

        <a href="/reservations" className="module-card">
          <div className="module-icon">🧾</div>
          <div>
            <h3>Rezervasyon Listesi</h3>
            <p>Tüm rezervasyonları görüntüle</p>
          </div>
        </a>

        <a href="/operations/arrival" className="module-card">
          <div className="module-icon">🛬</div>
          <div>
            <h3>Geliş Operasyonu</h3>
            <p>Bugünkü havalimanı karşılama işleri</p>
          </div>
        </a>

        <a href="/operations/departure" className="module-card">
          <div className="module-icon">🛫</div>
          <div>
            <h3>Dönüş Operasyonu</h3>
            <p>Bugünkü dönüş transferleri</p>
          </div>
        </a>

        <a href="/operations/hotel" className="module-card">
          <div className="module-icon">🏨</div>
          <div>
            <h3>Otel Operasyonu</h3>
            <p>Check-in ve check-out takip listesi</p>
          </div>
        </a>

        <a href="/operations/tour" className="module-card">
          <div className="module-icon">🚌</div>
          <div>
            <h3>Tur Operasyonu</h3>
            <p>Günlük tur ve araç organizasyonu</p>
          </div>
        </a>

        <a href="/vouchers" className="module-card">
          <div className="module-icon">🎫</div>
          <div>
            <h3>Voucher</h3>
            <p>Tek voucher içinde tüm hizmetleri göster</p>
          </div>
        </a>

        <a href="/reports" className="module-card">
          <div className="module-icon">📊</div>
          <div>
            <h3>Raporlar</h3>
            <p>Günlük, haftalık ve acente raporları</p>
          </div>
        </a>
      </div>
    </div>
  );
}
