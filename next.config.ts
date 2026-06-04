"use client";

import { useState, useCallback, useMemo } from "react";
 
// ─── Theme & Constants ────────────────────────────────────────────────────────
const T = {
  teal: "#0D9488",
  tealLight: "#CCFBF1",
  tealDark: "#0F766E",
  tealBg: "#F0FDFA",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  white: "#FFFFFF",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  success: "#059669",
  successBg: "#ECFDF5",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  info: "#2563EB",
  infoBg: "#EFF6FF",
};
 
const STATUS_CONFIG = {
  New: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  Option: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  Confirmed: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  Cancelled: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  "No Show": { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  Completed: { bg: "#F0FDFA", color: "#0D9488", border: "#99F6E4" },
};
 
// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_RESERVATIONS = [
  { id: "YU000001", status: "Confirmed", agency: "Neckermann Reisen", guest: "Hans Müller", hotel: "Sheraton Grand", checkIn: "2025-07-10", checkOut: "2025-07-17", pax: 2, services: ["Hotel", "Transfer"], total: 2850 },
  { id: "YU000002", status: "Option", agency: "TUI Group", guest: "Sophie Laurent", hotel: "Rixos Premium", checkIn: "2025-07-15", checkOut: "2025-07-22", pax: 4, services: ["Hotel", "Tour", "Transfer"], total: 6200 },
  { id: "YU000003", status: "New", agency: "Thomas Cook", guest: "Marco Rossi", hotel: "Kempinski Palace", checkIn: "2025-08-01", checkOut: "2025-08-08", pax: 2, services: ["Hotel", "Flight"], total: 3400 },
  { id: "YU000004", status: "Completed", agency: "Kuoni Travel", guest: "Anna Schmidt", hotel: "Titanic Belek", checkIn: "2025-06-01", checkOut: "2025-06-10", pax: 3, services: ["Hotel", "Transfer", "Tour"], total: 4750 },
  { id: "YU000005", status: "Cancelled", agency: "DER Touristik", guest: "James Wilson", hotel: "Akra Hotel", checkIn: "2025-07-20", checkOut: "2025-07-27", pax: 2, services: ["Hotel"], total: 1900 },
  { id: "YU000006", status: "Confirmed", agency: "Alltours", guest: "Maria Garcia", hotel: "Maxx Royal Belek", checkIn: "2025-08-10", checkOut: "2025-08-17", pax: 5, services: ["Hotel", "Transfer", "Tour", "Flight"], total: 9800 },
];
 
const AGENCIES = ["Neckermann Reisen", "TUI Group", "Thomas Cook", "Kuoni Travel", "DER Touristik", "Alltours", "Jet2holidays", "DERTOUR"];
const HOTELS = ["Sheraton Grand", "Rixos Premium", "Kempinski Palace", "Titanic Belek", "Akra Hotel", "Maxx Royal Belek", "Regnum Carya", "Cornelia Diamond"];
const REGIONS = ["Antalya", "Belek", "Kemer", "Side", "Alanya", "Bodrum", "Marmaris", "Fethiye"];
const VEHICLES = ["Sedan", "Minivan", "Minibus (16)", "Coach (50)", "VIP Van", "Luxury Sedan"];
const SUPPLIERS = ["Antalya Tours Co.", "Belek Transfer", "Premium DMC", "Royal Service", "Sun Travel"];
const AIRLINES = ["Turkish Airlines", "Pegasus", "SunExpress", "Corendon", "Lufthansa", "British Airways"];
const TOURS = ["Pamukkale Day Tour", "Ephesus Tour", "Cappadocia Tour", "Boat Trip", "Jeep Safari", "Rafting", "City Tour Antalya"];
 
// ─── UI Primitives ────────────────────────────────────────────────────────────
const css = {
  sidebar: { width: 220, minHeight: "100vh", background: T.gray800, color: T.white, display: "flex", flexDirection: "column", flexShrink: 0 },
  main: { flex: 1, background: T.gray50, minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { background: T.white, borderBottom: `1px solid ${T.gray200}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  card: { background: T.white, border: `1px solid ${T.gray200}`, borderRadius: 8, padding: "20px 24px" },
  input: { width: "100%", padding: "7px 10px", border: `1px solid ${T.gray300}`, borderRadius: 6, fontSize: 13, color: T.gray800, background: T.white, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "7px 10px", border: `1px solid ${T.gray300}`, borderRadius: 6, fontSize: 13, color: T.gray800, background: T.white, outline: "none", boxSizing: "border-box" },
  label: { fontSize: 12, fontWeight: 600, color: T.gray500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "block" },
  btn: { padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 6 },
  btnPrimary: { background: T.teal, color: T.white },
  btnSecondary: { background: T.white, color: T.gray700, border: `1px solid ${T.gray300}` },
  btnDanger: { background: T.dangerBg, color: T.danger, border: `1px solid #FECACA` },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.gray500, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px solid ${T.gray200}`, background: T.gray50, whiteSpace: "nowrap" },
  td: { padding: "11px 14px", borderBottom: `1px solid ${T.gray100}`, color: T.gray700, verticalAlign: "middle" },
};
 
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};
 
const Field = ({ label, children, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={css.label}>{label}</label>
    {children}
  </div>
);
 
const Input = (props) => <input style={css.input} {...props} />;
const Select = ({ children, ...props }) => <select style={css.select} {...props}>{children}</select>;
const Textarea = (props) => <textarea style={{ ...css.input, resize: "vertical", minHeight: 70 }} {...props} />;
 
const Btn = ({ variant = "primary", children, ...props }) => (
  <button style={{ ...css.btn, ...(variant === "primary" ? css.btnPrimary : variant === "danger" ? css.btnDanger : css.btnSecondary) }} {...props}>
    {children}
  </button>
);
 
const SectionTitle = ({ children, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${T.teal}` }}>
    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.teal, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</h3>
    {action}
  </div>
);
 
const Grid = ({ cols = 4, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px 16px" }}>{children}</div>
);
 
// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊", group: null },
  { id: "reservations", label: "Reservations", icon: "📋", group: "Reservations" },
  { id: "new-reservation", label: "New Reservation", icon: "➕", group: "Reservations" },
  { id: "search", label: "Reservation Search", icon: "🔍", group: "Reservations" },
  { id: "vouchers", label: "Vouchers", icon: "🎫", group: null },
  { id: "master-data", label: "Master Data", icon: "🗂️", group: "Settings" },
];
 
const Sidebar = ({ active, onNav }) => {
  const groups = ["Reservations", "Settings"];
  const ungrouped = NAV_ITEMS.filter(i => !i.group);
  return (
    <div style={css.sidebar}>
      <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: T.teal, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: T.white }}>Y</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.white, letterSpacing: "-0.3px" }}>YU Travel</div>
            <div style={{ fontSize: 10, color: T.gray400, marginTop: 1 }}>Reservation System</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {ungrouped.map(item => <NavItem key={item.id} item={item} active={active} onNav={onNav} />)}
        {groups.map(g => {
          const items = NAV_ITEMS.filter(i => i.group === g);
          return (
            <div key={g} style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.gray500, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 4 }}>{g}</div>
              {items.map(item => <NavItem key={item.id} item={item} active={active} onNav={onNav} />)}
            </div>
          );
        })}
      </nav>
      <div style={{ padding: "12px 16px", borderTop: `1px solid rgba(255,255,255,0.08)`, fontSize: 11, color: T.gray500 }}>v1.0.0 · Reservation Module</div>
    </div>
  );
};
 
const NavItem = ({ item, active, onNav }) => {
  const isActive = active === item.id;
  return (
    <button onClick={() => onNav(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: isActive ? T.teal : "transparent", color: isActive ? T.white : T.gray400, fontSize: 13, fontWeight: isActive ? 600 : 400, transition: "all 0.15s", textAlign: "left", marginBottom: 2 }}>
      <span style={{ fontSize: 14 }}>{item.icon}</span>
      {item.label}
    </button>
  );
};
 
// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ onNav }) => {
  const stats = [
    { label: "Total Reservations", value: 247, change: "+12 this month", icon: "📋", color: T.teal },
    { label: "Confirmed", value: 156, change: "63.2% of total", icon: "✅", color: T.success },
    { label: "Pending Option", value: 34, change: "Awaiting confirmation", icon: "⏳", color: T.warning },
    { label: "This Month Revenue", value: "€ 128,400", change: "+8.4% vs last month", icon: "💰", color: T.info },
  ];
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.gray800 }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", color: T.gray500, fontSize: 13 }}>Welcome back · {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...css.card, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.gray500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.gray800, letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: T.gray400, marginTop: 4 }}>{s.change}</div>
              </div>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div style={css.card}>
          <SectionTitle children="Recent Reservations" action={<Btn variant="secondary" onClick={() => onNav("reservations")} style={{ fontSize: 12, padding: "4px 12px" }}>View All</Btn>} />
          <table style={css.table}>
            <thead><tr>
              {["Voucher", "Guest", "Hotel", "Check-in", "Status", "Total"].map(h => <th key={h} style={css.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {MOCK_RESERVATIONS.slice(0, 5).map(r => (
                <tr key={r.id} style={{ cursor: "pointer" }}>
                  <td style={{ ...css.td, fontWeight: 600, color: T.teal }}>{r.id}</td>
                  <td style={css.td}>{r.guest}</td>
                  <td style={css.td}>{r.hotel}</td>
                  <td style={css.td}>{r.checkIn}</td>
                  <td style={css.td}><StatusBadge status={r.status} /></td>
                  <td style={{ ...css.td, fontWeight: 600 }}>€ {r.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={css.card}>
          <SectionTitle children="Status Overview" />
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => {
            const count = MOCK_RESERVATIONS.filter(r => r.status === s).length;
            const pct = Math.round((count / MOCK_RESERVATIONS.length) * 100);
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, color: T.gray700 }}>{s}</div>
                <div style={{ width: 80, height: 6, background: T.gray100, borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: cfg.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: T.gray500, minWidth: 20, textAlign: "right" }}>{count}</div>
              </div>
            );
          })}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.gray100}` }}>
            <Btn variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onNav("new-reservation")}>
              + New Reservation
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};
 
// ─── Reservations List ────────────────────────────────────────────────────────
const ReservationsList = ({ onEdit, onNew }) => {
  const [filters, setFilters] = useState({ voucher: "", guest: "", agency: "", status: "", hotel: "" });
  const filtered = useMemo(() =>
    MOCK_RESERVATIONS.filter(r =>
      (!filters.voucher || r.id.includes(filters.voucher.toUpperCase())) &&
      (!filters.guest || r.guest.toLowerCase().includes(filters.guest.toLowerCase())) &&
      (!filters.agency || r.agency.toLowerCase().includes(filters.agency.toLowerCase())) &&
      (!filters.status || r.status === filters.status) &&
      (!filters.hotel || r.hotel.toLowerCase().includes(filters.hotel.toLowerCase()))
    ), [filters]);
 
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.gray800 }}>Reservations</h1>
          <p style={{ margin: "4px 0 0", color: T.gray500, fontSize: 13 }}>{filtered.length} of {MOCK_RESERVATIONS.length} reservations</p>
        </div>
        <Btn onClick={onNew}>+ New Reservation</Btn>
      </div>
      <div style={{ ...css.card, marginBottom: 16, padding: "14px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <div><label style={css.label}>Voucher No</label><Input placeholder="YU000001" value={filters.voucher} onChange={e => setFilters(f => ({ ...f, voucher: e.target.value }))} /></div>
          <div><label style={css.label}>Guest Name</label><Input placeholder="Search guest..." value={filters.guest} onChange={e => setFilters(f => ({ ...f, guest: e.target.value }))} /></div>
          <div><label style={css.label}>Agency</label><Input placeholder="Search agency..." value={filters.agency} onChange={e => setFilters(f => ({ ...f, agency: e.target.value }))} /></div>
          <div><label style={css.label}>Hotel</label><Input placeholder="Search hotel..." value={filters.hotel} onChange={e => setFilters(f => ({ ...f, hotel: e.target.value }))} /></div>
          <div><label style={css.label}>Status</label>
            <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
            </Select>
          </div>
        </div>
      </div>
      <div style={css.card}>
        <table style={css.table}>
          <thead><tr>
            {["Voucher No", "Status", "Agency", "Main Guest", "Hotel", "Check-in", "Check-out", "Pax", "Services", "Total Sale", "Actions"].map(h => <th key={h} style={css.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ background: T.white }} onMouseEnter={e => e.currentTarget.style.background = T.tealBg} onMouseLeave={e => e.currentTarget.style.background = T.white}>
                <td style={{ ...css.td, fontWeight: 700, color: T.teal, fontFamily: "monospace", fontSize: 13 }}>{r.id}</td>
                <td style={css.td}><StatusBadge status={r.status} /></td>
                <td style={{ ...css.td, maxWidth: 140 }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.agency}</span></td>
                <td style={{ ...css.td, fontWeight: 500 }}>{r.guest}</td>
                <td style={{ ...css.td, maxWidth: 140 }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.hotel}</span></td>
                <td style={{ ...css.td, whiteSpace: "nowrap" }}>{r.checkIn}</td>
                <td style={{ ...css.td, whiteSpace: "nowrap" }}>{r.checkOut}</td>
                <td style={{ ...css.td, textAlign: "center", fontWeight: 600 }}>{r.pax}</td>
                <td style={css.td}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {r.services.map(s => (
                      <span key={s} style={{ background: T.tealLight, color: T.tealDark, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </td>
                <td style={{ ...css.td, fontWeight: 700, color: T.gray800, whiteSpace: "nowrap" }}>€ {r.total.toLocaleString()}</td>
                <td style={css.td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onEdit(r)} style={{ padding: "4px 10px", fontSize: 12, borderRadius: 5, border: `1px solid ${T.gray300}`, background: T.white, cursor: "pointer", color: T.gray700 }}>Edit</button>
                    <button style={{ padding: "4px 10px", fontSize: 12, borderRadius: 5, border: `1px solid ${T.gray300}`, background: T.white, cursor: "pointer", color: T.teal }}>Voucher</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: T.gray400 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No reservations match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
};
 
// ─── Reservation Form ─────────────────────────────────────────────────────────
const TABS = ["General Info", "Guests", "Hotel", "Transfers", "Tours / Extras", "Flight / Ticket", "Price", "Notes", "Voucher Preview"];
 
const emptyGuest = () => ({ title: "Mr", firstName: "", lastName: "", age: "", nationality: "", passportNo: "", phone: "", email: "" });
const emptyTransfer = () => ({ type: "Arrival", date: "", time: "", from: "", to: "", flightNo: "", vehicle: "", region: "", adults: 1, children: 0, infants: 0, supplier: "", driver: "", costPrice: "", salePrice: "", currency: "EUR", status: "Pending", notes: "" });
const emptyService = () => ({ type: "Tour", name: "", date: "", pickupTime: "", pickupPlace: "", adults: 1, children: 0, infants: 0, language: "English", supplier: "", costPrice: "", salePrice: "", currency: "EUR", status: "Pending", notes: "" });
const emptyFlight = () => ({ airline: "", pnr: "", ticketNo: "", from: "", to: "", date: "", time: "", baggage: "", costPrice: "", salePrice: "", currency: "EUR", notes: "" });
const emptyHotel = () => ({ hotel: "", region: "", checkIn: "", checkOut: "", nights: 0, roomType: "Standard", board: "All Inclusive", rooms: 1, confirmNo: "", supplier: "", costPrice: "", salePrice: "", currency: "EUR", notes: "" });
 
const genVoucher = () => `YU${String(Math.floor(Math.random() * 999999) + 1).padStart(6, "0")}`;
 
const ReservationForm = ({ initial, onSave, onCancel }) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(() => initial || {
    voucherNo: genVoucher(), date: new Date().toISOString().split("T")[0], status: "New",
    agency: "", market: "", source: "", salesperson: "", currency: "EUR", language: "English", notes: "",
    guests: [emptyGuest()],
    hotel: emptyHotel(),
    transfers: [],
    services: [],
    flights: [],
  });
 
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setHotel = (key, val) => {
    setForm(f => {
      const h = { ...f.hotel, [key]: val };
      if ((key === "checkIn" || key === "checkOut") && h.checkIn && h.checkOut) {
        const diff = Math.round((new Date(h.checkOut) - new Date(h.checkIn)) / 86400000);
        h.nights = Math.max(0, diff);
      }
      return { ...f, hotel: h };
    });
  };
 
  const totalCost = useMemo(() => {
    let t = 0;
    if (form.hotel.costPrice) t += parseFloat(form.hotel.costPrice) || 0;
    form.transfers.forEach(x => t += parseFloat(x.costPrice) || 0);
    form.services.forEach(x => t += parseFloat(x.costPrice) || 0);
    form.flights.forEach(x => t += parseFloat(x.costPrice) || 0);
    return t;
  }, [form]);
 
  const totalSale = useMemo(() => {
    let t = 0;
    if (form.hotel.salePrice) t += parseFloat(form.hotel.salePrice) || 0;
    form.transfers.forEach(x => t += parseFloat(x.salePrice) || 0);
    form.services.forEach(x => t += parseFloat(x.salePrice) || 0);
    form.flights.forEach(x => t += parseFloat(x.salePrice) || 0);
    return t;
  }, [form]);
 
  const profit = totalSale - totalCost;
 
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.gray800 }}>
            {initial ? `Edit Reservation · ${form.voucherNo}` : "New Reservation"}
          </h1>
          <p style={{ margin: "4px 0 0", color: T.gray500, fontSize: 13 }}>Complete all required sections before saving</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StatusBadge status={form.status} />
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn onClick={() => onSave(form)}>Save Reservation</Btn>
        </div>
      </div>
 
      {/* Tab Bar */}
      <div style={{ display: "flex", borderBottom: `2px solid ${T.gray200}`, marginBottom: 20, overflowX: "auto" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === i ? 700 : 400, color: tab === i ? T.teal : T.gray500, borderBottom: tab === i ? `2px solid ${T.teal}` : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap", transition: "color 0.15s" }}>
            {t}
          </button>
        ))}
      </div>
 
      {/* Tab Panels */}
      <div style={css.card}>
        {tab === 0 && <TabGeneral form={form} set={set} />}
        {tab === 1 && <TabGuests form={form} setForm={setForm} />}
        {tab === 2 && <TabHotel hotel={form.hotel} setHotel={setHotel} />}
        {tab === 3 && <TabTransfers form={form} setForm={setForm} />}
        {tab === 4 && <TabServices form={form} setForm={setForm} />}
        {tab === 5 && <TabFlights form={form} setForm={setForm} />}
        {tab === 6 && <TabPrice form={form} totalCost={totalCost} totalSale={totalSale} profit={profit} />}
        {tab === 7 && <TabNotes form={form} set={set} />}
        {tab === 8 && <VoucherPreview form={form} totalSale={totalSale} />}
      </div>
 
      {/* Bottom Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <Btn variant="secondary" onClick={() => setTab(t => Math.max(0, t - 1))} style={{ visibility: tab === 0 ? "hidden" : "visible" }}>← Previous</Btn>
        <Btn onClick={() => tab < TABS.length - 1 ? setTab(t => t + 1) : onSave(form)}>
          {tab < TABS.length - 1 ? "Next →" : "Save Reservation"}
        </Btn>
      </div>
    </div>
  );
};
 
// ─── Tab: General Info ────────────────────────────────────────────────────────
const TabGeneral = ({ form, set }) => (
  <div>
    <SectionTitle>General Information</SectionTitle>
    <Grid cols={4}>
      <Field label="Voucher No"><Input value={form.voucherNo} readOnly style={{ ...css.input, background: T.gray50, fontWeight: 700, color: T.teal, fontFamily: "monospace" }} /></Field>
      <Field label="Reservation Date"><Input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></Field>
      <Field label="Status">
        <Select value={form.status} onChange={e => set("status", e.target.value)}>
          {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
        </Select>
      </Field>
      <Field label="Currency">
        <Select value={form.currency} onChange={e => set("currency", e.target.value)}>
          {["EUR", "USD", "GBP", "CHF", "TRY"].map(c => <option key={c}>{c}</option>)}
        </Select>
      </Field>
      <Field label="Agency / Tour Operator" span={2}>
        <Select value={form.agency} onChange={e => set("agency", e.target.value)}>
          <option value="">Select Agency...</option>
          {AGENCIES.map(a => <option key={a}>{a}</option>)}
        </Select>
      </Field>
      <Field label="Market"><Input placeholder="e.g. Germany, UK..." value={form.market} onChange={e => set("market", e.target.value)} /></Field>
      <Field label="Source"><Input placeholder="e.g. Online, Direct..." value={form.source} onChange={e => set("source", e.target.value)} /></Field>
      <Field label="Sales Person"><Input placeholder="Sales person name..." value={form.salesperson} onChange={e => set("salesperson", e.target.value)} /></Field>
      <Field label="Language">
        <Select value={form.language} onChange={e => set("language", e.target.value)}>
          {["English", "German", "French", "Russian", "Arabic", "Dutch", "Italian"].map(l => <option key={l}>{l}</option>)}
        </Select>
      </Field>
    </Grid>
  </div>
);
 
// ─── Tab: Guests ──────────────────────────────────────────────────────────────
const TabGuests = ({ form, setForm }) => {
  const add = () => setForm(f => ({ ...f, guests: [...f.guests, emptyGuest()] }));
  const remove = i => setForm(f => ({ ...f, guests: f.guests.filter((_, idx) => idx !== i) }));
  const update = (i, k, v) => setForm(f => ({ ...f, guests: f.guests.map((g, idx) => idx === i ? { ...g, [k]: v } : g) }));
 
  return (
    <div>
      <SectionTitle action={<Btn onClick={add} style={{ fontSize: 12, padding: "4px 12px" }}>+ Add Guest</Btn>}>Guests</SectionTitle>
      {form.guests.map((g, i) => (
        <div key={i} style={{ border: `1px solid ${T.gray200}`, borderRadius: 8, padding: 16, marginBottom: 12, background: i === 0 ? T.tealBg : T.white }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.gray700 }}>{i === 0 ? "Main Guest" : `Guest ${i + 1}`}</span>
            {i > 0 && <button onClick={() => remove(i)} style={{ ...css.btn, ...css.btnDanger, fontSize: 12, padding: "3px 10px" }}>Remove</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 14px" }}>
            <Field label="Title"><Select value={g.title} onChange={e => update(i, "title", e.target.value)}>{["Mr", "Mrs", "Ms", "Child", "Infant", "Group"].map(t => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="First Name"><Input value={g.firstName} onChange={e => update(i, "firstName", e.target.value)} placeholder="First name" /></Field>
            <Field label="Last Name"><Input value={g.lastName} onChange={e => update(i, "lastName", e.target.value)} placeholder="Last name" /></Field>
            <Field label="Age"><Input type="number" value={g.age} onChange={e => update(i, "age", e.target.value)} placeholder="Age" /></Field>
            <Field label="Nationality"><Input value={g.nationality} onChange={e => update(i, "nationality", e.target.value)} placeholder="e.g. German" /></Field>
            <Field label="Passport No"><Input value={g.passportNo} onChange={e => update(i, "passportNo", e.target.value)} placeholder="Passport number" /></Field>
            <Field label="Phone"><Input value={g.phone} onChange={e => update(i, "phone", e.target.value)} placeholder="+49 xxx" /></Field>
            <Field label="Email"><Input type="email" value={g.email} onChange={e => update(i, "email", e.target.value)} placeholder="email@example.com" /></Field>
          </div>
        </div>
      ))}
    </div>
  );
};
 
// ─── Tab: Hotel ───────────────────────────────────────────────────────────────
const TabHotel = ({ hotel, setHotel }) => (
  <div>
    <SectionTitle>Hotel Details</SectionTitle>
    <Grid cols={4}>
      <Field label="Hotel" span={2}><Select value={hotel.hotel} onChange={e => setHotel("hotel", e.target.value)}><option value="">Select Hotel...</option>{HOTELS.map(h => <option key={h}>{h}</option>)}</Select></Field>
      <Field label="Region"><Select value={hotel.region} onChange={e => setHotel("region", e.target.value)}><option value="">Select Region...</option>{REGIONS.map(r => <option key={r}>{r}</option>)}</Select></Field>
      <Field label="Supplier"><Select value={hotel.supplier} onChange={e => setHotel("supplier", e.target.value)}><option value="">Select Supplier...</option>{SUPPLIERS.map(s => <option key={s}>{s}</option>)}</Select></Field>
      <Field label="Check-in Date"><Input type="date" value={hotel.checkIn} onChange={e => setHotel("checkIn", e.target.value)} /></Field>
      <Field label="Check-out Date"><Input type="date" value={hotel.checkOut} onChange={e => setHotel("checkOut", e.target.value)} /></Field>
      <Field label="Nights"><Input value={hotel.nights} readOnly style={{ ...css.input, background: T.gray50, fontWeight: 700, textAlign: "center" }} /></Field>
      <Field label="Room Count"><Input type="number" min="1" value={hotel.rooms} onChange={e => setHotel("rooms", e.target.value)} /></Field>
      <Field label="Room Type"><Select value={hotel.roomType} onChange={e => setHotel("roomType", e.target.value)}>{["Standard", "Superior", "Deluxe", "Suite", "Family Room", "Villa", "Bungalow"].map(r => <option key={r}>{r}</option>)}</Select></Field>
      <Field label="Board Type"><Select value={hotel.board} onChange={e => setHotel("board", e.target.value)}>{["All Inclusive", "Full Board", "Half Board", "Bed & Breakfast", "Room Only"].map(b => <option key={b}>{b}</option>)}</Select></Field>
      <Field label="Hotel Conf. No"><Input value={hotel.confirmNo} onChange={e => setHotel("confirmNo", e.target.value)} placeholder="Hotel confirmation..." /></Field>
      <Field label="Currency"><Select value={hotel.currency} onChange={e => setHotel("currency", e.target.value)}>{["EUR", "USD", "GBP", "CHF", "TRY"].map(c => <option key={c}>{c}</option>)}</Select></Field>
      <Field label="Cost Price"><Input type="number" value={hotel.costPrice} onChange={e => setHotel("costPrice", e.target.value)} placeholder="0.00" /></Field>
      <Field label="Sale Price"><Input type="number" value={hotel.salePrice} onChange={e => setHotel("salePrice", e.target.value)} placeholder="0.00" /></Field>
      <Field label="Notes" span={4}><Textarea value={hotel.notes} onChange={e => setHotel("notes", e.target.value)} placeholder="Hotel notes..." /></Field>
    </Grid>
  </div>
);
 
// ─── Tab: Transfers ───────────────────────────────────────────────────────────
const TabTransfers = ({ form, setForm }) => {
  const add = () => setForm(f => ({ ...f, transfers: [...f.transfers, emptyTransfer()] }));
  const remove = i => setForm(f => ({ ...f, transfers: f.transfers.filter((_, idx) => idx !== i) }));
  const update = (i, k, v) => setForm(f => ({ ...f, transfers: f.transfers.map((t, idx) => idx === i ? { ...t, [k]: v } : t) }));
 
  return (
    <div>
      <SectionTitle action={<Btn onClick={add} style={{ fontSize: 12, padding: "4px 12px" }}>+ Add Transfer</Btn>}>Transfers</SectionTitle>
      {form.transfers.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: T.gray400, background: T.gray50, borderRadius: 8, border: `1px dashed ${T.gray300}` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🚌</div>
          <div style={{ fontSize: 14, marginBottom: 12 }}>No transfers added yet</div>
          <Btn onClick={add} style={{ fontSize: 12 }}>+ Add Transfer</Btn>
        </div>
      )}
      {form.transfers.map((t, i) => (
        <div key={i} style={{ border: `1px solid ${T.gray200}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>{t.type} Transfer {i + 1}</span>
            <button onClick={() => remove(i)} style={{ ...css.btn, ...css.btnDanger, fontSize: 12, padding: "3px 10px" }}>Remove</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 14px" }}>
            <Field label="Transfer Type"><Select value={t.type} onChange={e => update(i, "type", e.target.value)}>{["Arrival", "Departure", "Intercity", "Hotel to Hotel", "Private Transfer"].map(x => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Date"><Input type="date" value={t.date} onChange={e => update(i, "date", e.target.value)} /></Field>
            <Field label="Time"><Input type="time" value={t.time} onChange={e => update(i, "time", e.target.value)} /></Field>
            <Field label="Flight No"><Input value={t.flightNo} onChange={e => update(i, "flightNo", e.target.value)} placeholder="e.g. TK1234" /></Field>
            <Field label="From Location"><Input value={t.from} onChange={e => update(i, "from", e.target.value)} placeholder="Departure point" /></Field>
            <Field label="To Location"><Input value={t.to} onChange={e => update(i, "to", e.target.value)} placeholder="Arrival point" /></Field>
            <Field label="Vehicle"><Select value={t.vehicle} onChange={e => update(i, "vehicle", e.target.value)}><option value="">Select...</option>{VEHICLES.map(v => <option key={v}>{v}</option>)}</Select></Field>
            <Field label="Region"><Select value={t.region} onChange={e => update(i, "region", e.target.value)}><option value="">Select...</option>{REGIONS.map(r => <option key={r}>{r}</option>)}</Select></Field>
            <Field label="Adults"><Input type="number" min="0" value={t.adults} onChange={e => update(i, "adults", e.target.value)} /></Field>
            <Field label="Children"><Input type="number" min="0" value={t.children} onChange={e => update(i, "children", e.target.value)} /></Field>
            <Field label="Infants"><Input type="number" min="0" value={t.infants} onChange={e => update(i, "infants", e.target.value)} /></Field>
            <Field label="Supplier"><Select value={t.supplier} onChange={e => update(i, "supplier", e.target.value)}><option value="">Select...</option>{SUPPLIERS.map(s => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Driver Name"><Input value={t.driver} onChange={e => update(i, "driver", e.target.value)} placeholder="Driver name..." /></Field>
            <Field label="Status"><Select value={t.status} onChange={e => update(i, "status", e.target.value)}>{["Pending", "Confirmed", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Cost Price"><Input type="number" value={t.costPrice} onChange={e => update(i, "costPrice", e.target.value)} placeholder="0.00" /></Field>
            <Field label="Sale Price"><Input type="number" value={t.salePrice} onChange={e => update(i, "salePrice", e.target.value)} placeholder="0.00" /></Field>
            <Field label="Notes" span={4}><Textarea value={t.notes} onChange={e => update(i, "notes", e.target.value)} placeholder="Transfer notes..." style={{ minHeight: 50 }} /></Field>
          </div>
        </div>
      ))}
    </div>
  );
};
 
// ─── Tab: Services ────────────────────────────────────────────────────────────
const TabServices = ({ form, setForm }) => {
  const add = () => setForm(f => ({ ...f, services: [...f.services, emptyService()] }));
  const remove = i => setForm(f => ({ ...f, services: f.services.filter((_, idx) => idx !== i) }));
  const update = (i, k, v) => setForm(f => ({ ...f, services: f.services.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));
 
  return (
    <div>
      <SectionTitle action={<Btn onClick={add} style={{ fontSize: 12, padding: "4px 12px" }}>+ Add Service</Btn>}>Tours & Extra Services</SectionTitle>
      {form.services.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: T.gray400, background: T.gray50, borderRadius: 8, border: `1px dashed ${T.gray300}` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎭</div>
          <div style={{ fontSize: 14, marginBottom: 12 }}>No tours or extras added yet</div>
          <Btn onClick={add} style={{ fontSize: 12 }}>+ Add Service</Btn>
        </div>
      )}
      {form.services.map((s, i) => (
        <div key={i} style={{ border: `1px solid ${T.gray200}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>{s.type} · Service {i + 1}</span>
            <button onClick={() => remove(i)} style={{ ...css.btn, ...css.btnDanger, fontSize: 12, padding: "3px 10px" }}>Remove</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 14px" }}>
            <Field label="Service Type"><Select value={s.type} onChange={e => update(i, "type", e.target.value)}>{["Tour", "Extra Service", "Entrance Ticket", "Activity", "Show", "Cruise", "Spa", "Car Rental"].map(x => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Service Name" span={2}><Select value={s.name} onChange={e => update(i, "name", e.target.value)}><option value="">Select or type...</option>{TOURS.map(t => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="Service Date"><Input type="date" value={s.date} onChange={e => update(i, "date", e.target.value)} /></Field>
            <Field label="Pickup Time"><Input type="time" value={s.pickupTime} onChange={e => update(i, "pickupTime", e.target.value)} /></Field>
            <Field label="Pickup Place"><Input value={s.pickupPlace} onChange={e => update(i, "pickupPlace", e.target.value)} placeholder="Hotel lobby..." /></Field>
            <Field label="Adults"><Input type="number" min="0" value={s.adults} onChange={e => update(i, "adults", e.target.value)} /></Field>
            <Field label="Children"><Input type="number" min="0" value={s.children} onChange={e => update(i, "children", e.target.value)} /></Field>
            <Field label="Infants"><Input type="number" min="0" value={s.infants} onChange={e => update(i, "infants", e.target.value)} /></Field>
            <Field label="Guide Language"><Select value={s.language} onChange={e => update(i, "language", e.target.value)}>{["English", "German", "French", "Russian", "Arabic", "Dutch"].map(l => <option key={l}>{l}</option>)}</Select></Field>
            <Field label="Supplier"><Select value={s.supplier} onChange={e => update(i, "supplier", e.target.value)}><option value="">Select...</option>{SUPPLIERS.map(x => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Status"><Select value={s.status} onChange={e => update(i, "status", e.target.value)}>{["Pending", "Confirmed", "Completed", "Cancelled"].map(x => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Cost Price"><Input type="number" value={s.costPrice} onChange={e => update(i, "costPrice", e.target.value)} placeholder="0.00" /></Field>
            <Field label="Sale Price"><Input type="number" value={s.salePrice} onChange={e => update(i, "salePrice", e.target.value)} placeholder="0.00" /></Field>
            <Field label="Notes" span={4}><Textarea value={s.notes} onChange={e => update(i, "notes", e.target.value)} placeholder="Service notes..." style={{ minHeight: 50 }} /></Field>
          </div>
        </div>
      ))}
    </div>
  );
};
 
// ─── Tab: Flights ─────────────────────────────────────────────────────────────
const TabFlights = ({ form, setForm }) => {
  const add = () => setForm(f => ({ ...f, flights: [...f.flights, emptyFlight()] }));
  const remove = i => setForm(f => ({ ...f, flights: f.flights.filter((_, idx) => idx !== i) }));
  const update = (i, k, v) => setForm(f => ({ ...f, flights: f.flights.map((fl, idx) => idx === i ? { ...fl, [k]: v } : fl) }));
 
  return (
    <div>
      <SectionTitle action={<Btn onClick={add} style={{ fontSize: 12, padding: "4px 12px" }}>+ Add Flight</Btn>}>Flight / Ticket</SectionTitle>
      {form.flights.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: T.gray400, background: T.gray50, borderRadius: 8, border: `1px dashed ${T.gray300}` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✈️</div>
          <div style={{ fontSize: 14, marginBottom: 12 }}>No flights added yet</div>
          <Btn onClick={add} style={{ fontSize: 12 }}>+ Add Flight</Btn>
        </div>
      )}
      {form.flights.map((fl, i) => (
        <div key={i} style={{ border: `1px solid ${T.gray200}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>Flight {i + 1}</span>
            <button onClick={() => remove(i)} style={{ ...css.btn, ...css.btnDanger, fontSize: 12, padding: "3px 10px" }}>Remove</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 14px" }}>
            <Field label="Airline"><Select value={fl.airline} onChange={e => update(i, "airline", e.target.value)}><option value="">Select...</option>{AIRLINES.map(a => <option key={a}>{a}</option>)}</Select></Field>
            <Field label="PNR"><Input value={fl.pnr} onChange={e => update(i, "pnr", e.target.value)} placeholder="e.g. ABC123" style={{ ...css.input, fontFamily: "monospace", textTransform: "uppercase" }} /></Field>
            <Field label="Ticket No"><Input value={fl.ticketNo} onChange={e => update(i, "ticketNo", e.target.value)} placeholder="Ticket number" /></Field>
            <Field label="Baggage"><Input value={fl.baggage} onChange={e => update(i, "baggage", e.target.value)} placeholder="e.g. 20kg" /></Field>
            <Field label="Departure City"><Input value={fl.from} onChange={e => update(i, "from", e.target.value)} placeholder="e.g. FRA" /></Field>
            <Field label="Arrival City"><Input value={fl.to} onChange={e => update(i, "to", e.target.value)} placeholder="e.g. AYT" /></Field>
            <Field label="Flight Date"><Input type="date" value={fl.date} onChange={e => update(i, "date", e.target.value)} /></Field>
            <Field label="Flight Time"><Input type="time" value={fl.time} onChange={e => update(i, "time", e.target.value)} /></Field>
            <Field label="Cost Price"><Input type="number" value={fl.costPrice} onChange={e => update(i, "costPrice", e.target.value)} placeholder="0.00" /></Field>
            <Field label="Sale Price"><Input type="number" value={fl.salePrice} onChange={e => update(i, "salePrice", e.target.value)} placeholder="0.00" /></Field>
            <Field label="Currency"><Select value={fl.currency} onChange={e => update(i, "currency", e.target.value)}>{["EUR", "USD", "GBP", "CHF", "TRY"].map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Notes" span={4}><Textarea value={fl.notes} onChange={e => update(i, "notes", e.target.value)} placeholder="Flight notes..." style={{ minHeight: 50 }} /></Field>
          </div>
        </div>
      ))}
    </div>
  );
};
 
// ─── Tab: Price ───────────────────────────────────────────────────────────────
const TabPrice = ({ form, totalCost, totalSale, profit }) => {
  const rows = [];
  if (form.hotel.hotel) rows.push({ service: "Hotel", name: form.hotel.hotel, cost: parseFloat(form.hotel.costPrice) || 0, sale: parseFloat(form.hotel.salePrice) || 0 });
  form.transfers.forEach((t, i) => rows.push({ service: `${t.type} Transfer`, name: t.from && t.to ? `${t.from} → ${t.to}` : `Transfer ${i + 1}`, cost: parseFloat(t.costPrice) || 0, sale: parseFloat(t.salePrice) || 0 }));
  form.services.forEach((s, i) => rows.push({ service: s.type, name: s.name || `Service ${i + 1}`, cost: parseFloat(s.costPrice) || 0, sale: parseFloat(s.salePrice) || 0 }));
  form.flights.forEach((fl, i) => rows.push({ service: "Flight", name: fl.airline ? `${fl.airline} ${fl.from}-${fl.to}` : `Flight ${i + 1}`, cost: parseFloat(fl.costPrice) || 0, sale: parseFloat(fl.salePrice) || 0 }));
 
  const margin = totalSale > 0 ? ((profit / totalSale) * 100).toFixed(1) : 0;
 
  return (
    <div>
      <SectionTitle>Price Summary</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Cost", value: totalCost, color: T.danger, bg: T.dangerBg },
          { label: "Total Sale", value: totalSale, color: T.success, bg: T.successBg },
          { label: `Profit · ${margin}% margin`, value: profit, color: profit >= 0 ? T.teal : T.danger, bg: profit >= 0 ? T.tealBg : T.dangerBg },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}30`, borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, letterSpacing: "-0.5px" }}>{form.currency} {c.value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        ))}
      </div>
      <table style={css.table}>
        <thead><tr>
          {["Service Type", "Description", "Cost Price", "Sale Price", "Profit"].map(h => <th key={h} style={css.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={5} style={{ ...css.td, textAlign: "center", color: T.gray400, padding: 30 }}>No services added yet</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ ...css.td, fontWeight: 600 }}>{r.service}</td>
              <td style={css.td}>{r.name}</td>
              <td style={{ ...css.td, color: T.danger, fontWeight: 500 }}>{form.currency} {r.cost.toFixed(2)}</td>
              <td style={{ ...css.td, color: T.success, fontWeight: 500 }}>{form.currency} {r.sale.toFixed(2)}</td>
              <td style={{ ...css.td, fontWeight: 600, color: (r.sale - r.cost) >= 0 ? T.teal : T.danger }}>{form.currency} {(r.sale - r.cost).toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ background: T.gray50, borderTop: `2px solid ${T.gray200}` }}>
            <td colSpan={2} style={{ ...css.td, fontWeight: 700, fontSize: 13 }}>TOTAL</td>
            <td style={{ ...css.td, fontWeight: 700, color: T.danger }}>{form.currency} {totalCost.toFixed(2)}</td>
            <td style={{ ...css.td, fontWeight: 700, color: T.success }}>{form.currency} {totalSale.toFixed(2)}</td>
            <td style={{ ...css.td, fontWeight: 700, color: profit >= 0 ? T.teal : T.danger }}>{form.currency} {profit.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
 
// ─── Tab: Notes ───────────────────────────────────────────────────────────────
const TabNotes = ({ form, set }) => (
  <div>
    <SectionTitle>Notes & Remarks</SectionTitle>
    <Grid cols={1}>
      <Field label="Internal Notes"><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Internal notes visible to staff only..." style={{ minHeight: 120 }} /></Field>
    </Grid>
  </div>
);
 
// ─── Voucher Preview ──────────────────────────────────────────────────────────
const VoucherPreview = ({ form, totalSale }) => {
  const mainGuest = form.guests[0] || {};
  const guestName = [mainGuest.title, mainGuest.firstName, mainGuest.lastName].filter(Boolean).join(" ") || "—";
  const totalPax = form.guests.length;
 
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <SectionTitle children="Voucher Preview" />
        <Btn variant="secondary" style={{ fontSize: 12 }}>🖨️ Print Voucher</Btn>
      </div>
      <div style={{ border: `2px solid ${T.teal}`, borderRadius: 10, overflow: "hidden", fontFamily: "Georgia, serif" }}>
        {/* Header */}
        <div style={{ background: T.gray800, color: T.white, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>YU TRAVEL</div>
            <div style={{ fontSize: 11, color: T.gray400, marginTop: 2, letterSpacing: "0.1em" }}>INCOMING TRAVEL AGENCY · ANTALYA</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: T.gray400, marginBottom: 4 }}>VOUCHER NO</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.teal, fontFamily: "monospace" }}>{form.voucherNo}</div>
            <div style={{ fontSize: 11, color: T.gray400, marginTop: 4 }}>Date: {form.date}</div>
          </div>
        </div>
 
        <div style={{ padding: "20px 28px", fontFamily: "system-ui, sans-serif" }}>
          {/* Agency & Guest */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <VoucherSection title="Agency Information">
              <VRow label="Agency" value={form.agency || "—"} />
              <VRow label="Market" value={form.market || "—"} />
              <VRow label="Sales Person" value={form.salesperson || "—"} />
            </VoucherSection>
            <VoucherSection title="Guest Information">
              <VRow label="Main Guest" value={guestName} bold />
              <VRow label="Total Guests" value={`${totalPax} person(s)`} />
              <VRow label="Language" value={form.language} />
              <VRow label="Status" value={<StatusBadge status={form.status} />} />
            </VoucherSection>
          </div>
 
          {/* Hotel */}
          {form.hotel.hotel && (
            <VoucherSection title="🏨 Hotel" mb>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px 20px" }}>
                <VRow label="Hotel" value={form.hotel.hotel} bold />
                <VRow label="Region" value={form.hotel.region} />
                <VRow label="Board" value={form.hotel.board} />
                <VRow label="Check-in" value={form.hotel.checkIn} />
                <VRow label="Check-out" value={form.hotel.checkOut} />
                <VRow label="Nights" value={form.hotel.nights} />
                <VRow label="Room Type" value={form.hotel.roomType} />
                <VRow label="Rooms" value={form.hotel.rooms} />
                <VRow label="Conf. No" value={form.hotel.confirmNo || "—"} />
              </div>
            </VoucherSection>
          )}
 
          {/* Transfers */}
          {form.transfers.length > 0 && (
            <VoucherSection title="🚌 Transfers" mb>
              {form.transfers.map((t, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < form.transfers.length - 1 ? `1px solid ${T.gray100}` : "none" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px 16px" }}>
                    <VRow label="Type" value={t.type} bold />
                    <VRow label="Date" value={t.date} />
                    <VRow label="Time" value={t.time} />
                    <VRow label="Flight" value={t.flightNo || "—"} />
                    <VRow label="From" value={t.from || "—"} />
                    <VRow label="To" value={t.to || "—"} />
                    <VRow label="Vehicle" value={t.vehicle || "—"} />
                    <VRow label="Pax" value={`${t.adults}A ${t.children}C ${t.infants}I`} />
                  </div>
                </div>
              ))}
            </VoucherSection>
          )}
 
          {/* Tours */}
          {form.services.length > 0 && (
            <VoucherSection title="🎭 Tours & Extras" mb>
              {form.services.map((s, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < form.services.length - 1 ? `1px solid ${T.gray100}` : "none" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px 16px" }}>
                    <VRow label="Service" value={s.name || s.type} bold />
                    <VRow label="Date" value={s.date} />
                    <VRow label="Pickup" value={s.pickupTime} />
                    <VRow label="Pax" value={`${s.adults}A ${s.children}C ${s.infants}I`} />
                    <VRow label="From" value={s.pickupPlace || "—"} />
                    <VRow label="Language" value={s.language} />
                  </div>
                </div>
              ))}
            </VoucherSection>
          )}
 
          {/* Flights */}
          {form.flights.length > 0 && (
            <VoucherSection title="✈️ Flights" mb>
              {form.flights.map((fl, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < form.flights.length - 1 ? `1px solid ${T.gray100}` : "none" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px 16px" }}>
                    <VRow label="Airline" value={fl.airline} bold />
                    <VRow label="PNR" value={fl.pnr || "—"} />
                    <VRow label="Date" value={fl.date} />
                    <VRow label="Time" value={fl.time} />
                    <VRow label="Route" value={fl.from && fl.to ? `${fl.from} → ${fl.to}` : "—"} />
                    <VRow label="Baggage" value={fl.baggage || "—"} />
                  </div>
                </div>
              ))}
            </VoucherSection>
          )}
 
          {/* Notes */}
          {form.notes && (
            <VoucherSection title="📝 Notes">
              <p style={{ margin: 0, fontSize: 13, color: T.gray600, lineHeight: 1.6 }}>{form.notes}</p>
            </VoucherSection>
          )}
        </div>
 
        {/* Footer */}
        <div style={{ background: T.tealBg, borderTop: `2px solid ${T.teal}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: T.gray500 }}>YU Travel · Incoming Travel Agency · Antalya, Turkey</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.teal }}>Total: {form.currency} {totalSale.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  );
};
 
const VoucherSection = ({ title, children, mb }) => (
  <div style={{ marginBottom: mb ? 16 : 0, border: `1px solid ${T.gray200}`, borderRadius: 8, overflow: "hidden" }}>
    <div style={{ background: T.gray100, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: T.gray700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>
    <div style={{ padding: "12px 14px" }}>{children}</div>
  </div>
);
 
const VRow = ({ label, value, bold }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: T.gray400, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: bold ? 700 : 400, color: T.gray800 }}>{value || "—"}</div>
  </div>
);
 
// ─── Master Data ──────────────────────────────────────────────────────────────
const MasterData = () => {
  const [activeSection, setActiveSection] = useState("agencies");
  const sections = [
    { id: "agencies", label: "Agencies", icon: "🏢", data: AGENCIES },
    { id: "hotels", label: "Hotels", icon: "🏨", data: HOTELS },
    { id: "regions", label: "Regions", icon: "🗺️", data: REGIONS },
    { id: "vehicles", label: "Vehicles", icon: "🚗", data: VEHICLES },
    { id: "suppliers", label: "Suppliers", icon: "🤝", data: SUPPLIERS },
    { id: "airlines", label: "Airlines", icon: "✈️", data: AIRLINES },
    { id: "tours", label: "Tours", icon: "🎭", data: TOURS },
  ];
  const active = sections.find(s => s.id === activeSection);
 
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: T.gray800 }}>Master Data</h1>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
        <div style={css.card}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 6, border: "none", background: activeSection === s.id ? T.tealBg : "transparent", color: activeSection === s.id ? T.teal : T.gray600, fontWeight: activeSection === s.id ? 700 : 400, fontSize: 13, cursor: "pointer", marginBottom: 2, textAlign: "left" }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <div style={css.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.gray800 }}>{active.icon} {active.label}</h3>
            <Btn style={{ fontSize: 12, padding: "6px 12px" }}>+ Add New</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {active.data.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: `1px solid ${T.gray200}`, borderRadius: 6, fontSize: 13, color: T.gray700 }}>
                <span>{item}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ fontSize: 11, border: `1px solid ${T.gray200}`, background: T.white, padding: "2px 8px", borderRadius: 4, cursor: "pointer", color: T.gray500 }}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
 
// ─── Vouchers Page ────────────────────────────────────────────────────────────
const Vouchers = ({ onView }) => (
  <div style={{ padding: 24 }}>
    <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: T.gray800 }}>Vouchers</h1>
    <div style={css.card}>
      <table style={css.table}>
        <thead><tr>
          {["Voucher No", "Guest", "Agency", "Hotel", "Check-in", "Status", "Actions"].map(h => <th key={h} style={css.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {MOCK_RESERVATIONS.map(r => (
            <tr key={r.id}>
              <td style={{ ...css.td, fontWeight: 700, color: T.teal, fontFamily: "monospace" }}>{r.id}</td>
              <td style={css.td}>{r.guest}</td>
              <td style={css.td}>{r.agency}</td>
              <td style={css.td}>{r.hotel}</td>
              <td style={css.td}>{r.checkIn}</td>
              <td style={css.td}><StatusBadge status={r.status} /></td>
              <td style={css.td}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onView(r)} style={{ padding: "4px 10px", fontSize: 12, borderRadius: 5, border: `1px solid ${T.teal}`, background: T.tealBg, cursor: "pointer", color: T.teal, fontWeight: 600 }}>View</button>
                  <button style={{ padding: "4px 10px", fontSize: 12, borderRadius: 5, border: `1px solid ${T.gray300}`, background: T.white, cursor: "pointer", color: T.gray600 }}>Print</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
 
// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [editTarget, setEditTarget] = useState(null);
 
  const handleNav = useCallback((p) => { setPage(p); setEditTarget(null); }, []);
  const handleEdit = useCallback((r) => { setEditTarget(r); setPage("new-reservation"); }, []);
  const handleSave = useCallback(() => { setPage("reservations"); setEditTarget(null); }, []);
 
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontSize: 14, color: T.gray800, background: T.gray50 }}>
      <Sidebar active={page} onNav={handleNav} />
      <div style={css.main}>
        <div style={css.topbar}>
          <div style={{ fontSize: 13, color: T.gray500, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: T.gray300 }}>YU Travel</span>
            <span style={{ color: T.gray300 }}>›</span>
            <span style={{ color: T.gray700, fontWeight: 500, textTransform: "capitalize" }}>{page.replace(/-/g, " ")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 12, color: T.gray500 }}>Reservation Module</div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.white }}>A</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {page === "dashboard" && <Dashboard onNav={handleNav} />}
          {page === "reservations" && <ReservationsList onEdit={handleEdit} onNew={() => handleNav("new-reservation")} />}
          {page === "new-reservation" && <ReservationForm initial={editTarget ? { voucherNo: editTarget.id, status: editTarget.status, agency: editTarget.agency, guests: [emptyGuest()], hotel: emptyHotel(), transfers: [], services: [], flights: [], date: editTarget.checkIn, currency: "EUR", language: "English", market: "", source: "", salesperson: "", notes: "" } : null} onSave={handleSave} onCancel={() => handleNav("reservations")} />}
          {page === "search" && <ReservationsList onEdit={handleEdit} onNew={() => handleNav("new-reservation")} />}
          {page === "vouchers" && <Vouchers onView={(r) => handleEdit(r)} />}
          {page === "master-data" && <MasterData />}
        </div>
      </div>
    </div>
  );
}
 