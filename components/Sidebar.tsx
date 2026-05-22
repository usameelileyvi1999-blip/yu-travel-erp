export default function Sidebar({ activePage, setActivePage }: any) {
  const menus = [
    'Dashboard',
    'Rezervasyonlar',
    'Operasyon',
    'Muhasebe',
    'Raporlar',
    'Tanımlar',
  ]

  return (
    <aside style={sidebar}>
      <div>
        <h1 style={logo}>YU ERP</h1>
        <p style={subtitle}>Incoming Tourism</p>
      </div>

      <div style={{ marginTop: 35 }}>
        {menus.map((menu) => (
          <button
            key={menu}
            onClick={() => setActivePage(menu)}
            style={{
              ...button,
              background:
                activePage === menu
                  ? 'linear-gradient(90deg,#0EA5E9,#0284C7)'
                  : '#162338',
            }}
          >
            {menu}
          </button>
        ))}
      </div>
    </aside>
  )
}

const sidebar = {
  width: '280px',
  background: 'linear-gradient(180deg,#081126,#0A1533)',
  color: 'white',
  padding: '28px',
  minHeight: '100vh',
}

const logo = {
  margin: 0,
  fontSize: 38,
  fontWeight: 700,
}

const subtitle = {
  color: '#9CA3AF',
  marginTop: 6,
}

const button = {
  width: '100%',
  padding: '18px',
  border: 'none',
  borderRadius: '16px',
  color: 'white',
  marginBottom: '12px',
  fontSize: '18px',
  cursor: 'pointer',
  textAlign: 'left' as const,
}