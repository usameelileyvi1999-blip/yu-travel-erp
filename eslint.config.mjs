'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type AnyRow = Record<string, any>
type TabName = 'Dashboard' | 'Rezervasyonlar' | 'Operasyon' | 'Turlar' | 'Faturalama' | 'Oteller & Servisler' | 'Yönetimsel Raporlar' | 'Ayarlar'

type ServiceDraft = {
  uid: string
  enabled: boolean
  kind: 'arrival' | 'departure' | 'tour' | 'hotel' | 'flight' | 'extra'
  label: string
  date: string
  time: string
  name: string
  flight: string
  pickup: string
  dropoff: string
  sale: string
  cost: string
  supplier: string
  note: string
}

const money = (value: any) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(Number(value || 0))
const todayIso = () => new Date().toISOString().slice(0, 10)
const compactPhone = (phone: string) => String(phone || '').replaceAll(' ', '').replaceAll('-', '').replace('+', '')

const tabList: TabName[] = ['Dashboard', 'Rezervasyonlar', 'Operasyon', 'Turlar', 'Faturalama', 'Oteller & Servisler', 'Yönetimsel Raporlar', 'Ayarlar']

const reservationTypeOptions = [
  { value: 'transfer', label: 'Sadece Transfer' },
  { value: 'hotel_transfer', label: 'Otel + Transfer' },
  { value: 'hotel_transfer_tour', label: 'Otel + Transfer + Tur' },
  { value: 'hotel', label: 'Sadece Otel' },
  { value: 'tour', label: 'Sadece Tur' },
  { value: 'package', label: 'Özel Paket' },
]

const serviceTemplates: Omit<ServiceDraft, 'enabled'>[] = [
  { uid: 'arrival', kind: 'arrival', label: 'Geliş Transfer', date: todayIso(), time: '', name: 'Geliş Transfer', flight: '', pickup: 'Antalya Airport', dropoff: '', sale: '', cost: '', supplier: '', note: '' },
  { uid: 'departure', kind: 'departure', label: 'Dönüş Transfer', date: '', time: '', name: 'Dönüş Transfer', flight: '', pickup: '', dropoff: 'Antalya Airport', sale: '', cost: '', supplier: '', note: '' },
  { uid: 'hotel', kind: 'hotel', label: 'Otel', date: todayIso(), time: '', name: '', flight: '', pickup: '', dropoff: '', sale: '', cost: '', supplier: '', note: '' },
  { uid: 'tour', kind: 'tour', label: 'Tur', date: '', time: '', name: '', flight: '', pickup: '', dropoff: '', sale: '', cost: '', supplier: '', note: '' },
  { uid: 'flight', kind: 'flight', label: 'Uçak Bileti', date: '', time: '', name: 'Uçak Bileti', flight: '', pickup: '', dropoff: '', sale: '', cost: '', supplier: '', note: '' },
  { uid: 'extra', kind: 'extra', label: 'Ekstra Servis', date: '', time: '', name: '', flight: '', pickup: '', dropoff: '', sale: '', cost: '', supplier: '', note: '' },
]

const createEmptyServices = (type = 'transfer') => serviceTemplates.map((s) => ({
  ...s,
  enabled:
    type === 'transfer' ? ['arrival', 'departure'].includes(s.kind) :
    type === 'hotel_transfer' ? ['hotel', 'arrival', 'departure'].includes(s.kind) :
    type === 'hotel_transfer_tour' ? ['hotel', 'arrival', 'departure', 'tour'].includes(s.kind) :
    type === 'hotel' ? s.kind === 'hotel' :
    type === 'tour' ? s.kind === 'tour' : false,
}))

const serviceTitle = (r: AnyRow) => {
  const op = String(r.operation_type || '')
  const st = String(r.service_type || '')
  if (op === 'arrival') return 'Geliş Transfer'
  if (op === 'departure') return 'Dönüş Transfer'
  if (op === 'tour' || st.toLowerCase().includes('tour')) return r.tour_name || 'Tur'
  if (op === 'hotel' || st.toLowerCase().includes('hotel')) return r.hotel_name || 'Otel'
  if (op === 'flight') return 'Uçak Bileti'
  if (op === 'extra') return r.extra_service_name || 'Ekstra Servis'
  return st || 'Servis'
}

const operationLabel = (type: string) => {
  if (type === 'arrival') return 'Geliş'
  if (type === 'departure') return 'Dönüş'
  if (type === 'tour') return 'Tur'
  if (type === 'hotel') return 'Otel'
  if (type === 'flight') return 'Uçak'
  if (type === 'extra') return 'Ekstra'
  return type || '-'
}

export default function Page() {
  const today = todayIso()
  const [session, setSession] = useState<any>(null)
  const [loginLoading, setLoginLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [active, setActive] = useState<TabName>('Dashboard')

  const [reservations, setReservations] = useState<AnyRow[]>([])
  const [finance, setFinance] = useState<AnyRow[]>([])
  const [agencies, setAgencies] = useState<AnyRow[]>([])
  const [regions, setRegions] = useState<AnyRow[]>([])
  const [hotels, setHotels] = useState<AnyRow[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<AnyRow[]>([])
  const [drivers, setDrivers] = useState<AnyRow[]>([])
  const [fleet, setFleet] = useState<AnyRow[]>([])
  const [tours, setTours] = useState<AnyRow[]>([])
  const [packages, setPackages] = useState<AnyRow[]>([])
  const [roomTypes, setRoomTypes] = useState<AnyRow[]>([])
  const [boardTypes, setBoardTypes] = useState<AnyRow[]>([])
  const [extraServices, setExtraServices] = useState<AnyRow[]>([])
  const [companySettings, setCompanySettings] = useState<AnyRow>({ company_name: 'YU Travel', whatsapp: '+90 535 764 54 08', email: 'info@yutravel.com', address: 'Antalya / Türkiye' })

  const [reservationForm, setReservationForm] = useState({
    reservation_type: 'transfer', customer_name: '', customer_phone: '', agency_name: '', hotel_name: '', region_name: '', pax_adult: '1', vehicle_type: '', room_type: '', board_type: '', payment_status: 'unpaid', operation_status: 'option', notes: '', currency: 'USD'
  })
  const [services, setServices] = useState<ServiceDraft[]>(createEmptyServices('transfer'))
  const [search, setSearch] = useState('')
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null)
  const [opFrom, setOpFrom] = useState(today)
  const [opTo, setOpTo] = useState(today)
  const [opType, setOpType] = useState('all')
  const [opStatus, setOpStatus] = useState('all')
  const [reportFrom, setReportFrom] = useState(today)
  const [reportTo, setReportTo] = useState(today)
  const [definitionEdit, setDefinitionEdit] = useState<{ table: string; id: string } | null>(null)
  const [definitionInputs, setDefinitionInputs] = useState<Record<string, string>>({ agencies: '', regions: '', hotels: '', vehicle_types: '', drivers: '', vehicles: '', tours: '', packages: '', room_types: '', board_types: '', extra_services: '' })
  const [financeForm, setFinanceForm] = useState({ type: 'income', category: 'cash', payment_method: 'cash', related_party: '', amount: '', transaction_date: today, description: '' })

  useEffect(() => {
    checkSession()
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) loadAll()
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function checkSession() {
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
    if (data.session) await loadAll()
    setLoginLoading(false)
  }

  async function login() {
    if (!loginEmail || !loginPassword) return alert('Email ve şifre gir')
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    setLoginLoading(false)
    if (error) return alert(error.message)
    await loadAll()
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  async function loadAll() {
    const [res, fn, ag, rg, ht, vt, dr, fl, tr, pk, rt, bt, es, cs] = await Promise.all([
      supabase.from('reservations').select('*').order('created_at', { ascending: false }),
      supabase.from('finance_transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('agencies').select('*').order('created_at', { ascending: false }),
      supabase.from('regions').select('*').order('created_at', { ascending: false }),
      supabase.from('hotels').select('*').order('created_at', { ascending: false }),
      supabase.from('vehicle_types').select('*').order('created_at', { ascending: false }),
      supabase.from('drivers').select('*').order('created_at', { ascending: false }),
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('tours').select('*').order('created_at', { ascending: false }),
      supabase.from('packages').select('*').order('created_at', { ascending: false }),
      supabase.from('room_types').select('*').order('created_at', { ascending: false }),
      supabase.from('board_types').select('*').order('created_at', { ascending: false }),
      supabase.from('extra_services').select('*').order('created_at', { ascending: false }),
      supabase.from('company_settings').select('*').limit(1).maybeSingle(),
    ])
    if (res.data) setReservations(res.data)
    if (fn.data) setFinance(fn.data)
    if (ag.data) setAgencies(ag.data)
    if (rg.data) setRegions(rg.data)
    if (ht.data) setHotels(ht.data)
    if (vt.data) setVehicleTypes(vt.data)
    if (dr.data) setDrivers(dr.data)
    if (fl.data) setFleet(fl.data)
    if (tr.data) setTours(tr.data)
    if (pk.data) setPackages(pk.data)
    if (rt.data) setRoomTypes(rt.data)
    if (bt.data) setBoardTypes(bt.data)
    if (es.data) setExtraServices(es.data)
    if (cs.data) setCompanySettings(cs.data)
  }

  const voucherGroups = useMemo(() => {
    const map = new Map<string, AnyRow[]>()
    reservations.forEach((r) => {
      const code = String(r.reservation_code || r.id || 'NO-CODE')
      const baseCode = code.replace(/-(A|D)$/i, '')
      if (!map.has(baseCode)) map.set(baseCode, [])
      map.get(baseCode)!.push(r)
    })
    return Array.from(map.entries()).map(([code, rows]) => {
      const sorted = [...rows].sort((a, b) => String(a.service_date || '').localeCompare(String(b.service_date || '')))
      const first = sorted[0] || {}
      const sale = sorted.reduce((s, r) => s + Number(r.sale_amount || 0), 0)
      const cost = sorted.reduce((s, r) => s + Number(r.cost_amount || 0), 0)
      return { code, first, rows: sorted, sale, cost, profit: sale - cost }
    }).sort((a, b) => String(b.first.created_at || '').localeCompare(String(a.first.created_at || '')))
  }, [reservations])

  const filteredVouchers = voucherGroups.filter((g) => {
    const text = `${g.code} ${g.first.customer_name || ''} ${g.first.customer_phone || ''} ${g.first.agency_name || ''} ${g.first.hotel_name || ''} ${g.first.region_name || ''}`.toLowerCase()
    return !search.trim() || text.includes(search.toLowerCase())
  })

  const selectedVoucherRows = selectedVoucher ? (voucherGroups.find((g) => g.code === selectedVoucher)?.rows || []) : []

  const operationRows = useMemo(() => reservations
    .filter((r) => {
      const d = String(r.service_date || '')
      const dateOk = d >= opFrom && d <= opTo
      const typeOk = opType === 'all' || r.operation_type === opType
      const statusOk = opStatus === 'all' || r.operation_status === opStatus
      return dateOk && typeOk && statusOk
    })
    .sort((a, b) => `${a.service_date || ''} ${a.operation_time || '99:99'}`.localeCompare(`${b.service_date || ''} ${b.operation_time || '99:99'}`)), [reservations, opFrom, opTo, opType, opStatus])

  const reportRows = reservations.filter((r) => String(r.service_date || '') >= reportFrom && String(r.service_date || '') <= reportTo)
  const dashboardToday = reservations.filter((r) => r.service_date === today)
  const totalSales = reservations.reduce((s, r) => s + Number(r.sale_amount || 0), 0)
  const totalCost = reservations.reduce((s, r) => s + Number(r.cost_amount || 0), 0)
  const financeBalance = finance.reduce((s, f) => s + (f.type === 'expense' ? -Number(f.amount || 0) : Number(f.amount || 0)), 0)

  function updateReservation(key: string, value: string) {
    const newForm = { ...reservationForm, [key]: value }
    setReservationForm(newForm)
    if (key === 'reservation_type') setServices(createEmptyServices(value))
  }

  function updateService(uid: string, key: keyof ServiceDraft, value: any) {
    setServices((old) => old.map((s) => s.uid === uid ? { ...s, [key]: value } : s))
  }

  function nextVoucherNo() {
    const nums = voucherGroups.map((g) => {
      const m = String(g.code || '').match(/YU(\d+)/i)
      return m ? Number(m[1]) : NaN
    }).filter((n) => !Number.isNaN(n))
    const next = nums.length ? Math.max(...nums) + 1 : 1
    return 'YU' + String(next).padStart(4, '0')
  }

  async function saveReservation() {
    const enabled = services.filter((s) => s.enabled)
    if (!reservationForm.customer_name.trim()) return alert('Müşteri adı zorunlu')
    if (!reservationForm.customer_phone.trim()) return alert('Telefon / WhatsApp zorunlu')
    if (!reservationForm.agency_name.trim()) return alert('Acente seçmelisin')
    if (!enabled.length) return alert('En az bir hizmet seçmelisin')
    if (!Number(reservationForm.pax_adult || 0)) return alert('PAX en az 1 olmalı')
    const invalid = enabled.find((s) => !s.date && !['hotel', 'flight', 'extra'].includes(s.kind))
    if (invalid) return alert(`${invalid.label} için tarih zorunlu`)

    const voucherNo = nextVoucherNo()
    const rows = enabled.map((s) => {
      const kind = s.kind
      const serviceName = s.name || s.label
      const isTransfer = kind === 'arrival' || kind === 'departure'
      return {
        reservation_code: voucherNo,
        reservation_type: reservationForm.reservation_type,
        customer_name: reservationForm.customer_name,
        customer_phone: reservationForm.customer_phone,
        agency_name: reservationForm.agency_name,
        hotel_name: kind === 'hotel' ? (s.name || reservationForm.hotel_name) : reservationForm.hotel_name,
        region_name: reservationForm.region_name,
        pax_adult: Number(reservationForm.pax_adult || 0),
        vehicle_type: isTransfer ? reservationForm.vehicle_type : '',
        room_type: reservationForm.room_type,
        board_type: reservationForm.board_type,
        payment_status: reservationForm.payment_status,
        operation_status: reservationForm.operation_status,
        service_type: s.label,
        operation_type: kind,
        service_date: s.date || today,
        flight_code: s.flight,
        pickup_location: s.pickup || (kind === 'departure' ? reservationForm.hotel_name : ''),
        tour_name: kind === 'tour' ? serviceName : '',
        package_name: reservationForm.reservation_type === 'package' ? serviceName : '',
        extra_service_name: kind === 'extra' ? serviceName : '',
        package_has_hotel: enabled.some((x) => x.kind === 'hotel'),
        package_has_transfer: enabled.some((x) => x.kind === 'arrival' || x.kind === 'departure'),
        package_has_tour: enabled.some((x) => x.kind === 'tour'),
        package_has_flight: enabled.some((x) => x.kind === 'flight'),
        package_flight_note: kind === 'flight' ? s.note : '',
        sale_amount: Number(s.sale || 0),
        cost_amount: Number(s.cost || 0),
        currency: reservationForm.currency,
        notes: [reservationForm.notes, s.dropoff ? `Varış: ${s.dropoff}` : '', s.time ? `Saat: ${s.time}` : '', s.supplier ? `Tedarikçi: ${s.supplier}` : '', s.note].filter(Boolean).join(' | '),
      }
    })

    const { error } = await supabase.from('reservations').insert(rows as any)
    if (error) return alert(error.message)
    alert(`Rezervasyon kaydedildi. Tek voucher: ${voucherNo}. Operasyona ${rows.length} ayrı iş düştü.`)
    setReservationForm({ reservation_type: 'transfer', customer_name: '', customer_phone: '', agency_name: '', hotel_name: '', region_name: '', pax_adult: '1', vehicle_type: '', room_type: '', board_type: '', payment_status: 'unpaid', operation_status: 'option', notes: '', currency: 'USD' })
    setServices(createEmptyServices('transfer'))
    await loadAll()
  }

  async function deleteVoucher(code: string) {
    if (!confirm(`${code} voucher ve bağlı operasyon işleri silinsin mi?`)) return
    const ids = (voucherGroups.find((g) => g.code === code)?.rows || []).map((r) => r.id)
    if (!ids.length) return
    const { error } = await supabase.from('reservations').delete().in('id', ids)
    if (error) return alert(error.message)
    if (selectedVoucher === code) setSelectedVoucher(null)
    await loadAll()
  }

  async function deleteOperation(id: string) {
    if (!confirm('Bu operasyon işini silmek istiyor musun?')) return
    const { error } = await supabase.from('reservations').delete().eq('id', id)
    if (error) return alert(error.message)
    await loadAll()
  }

  async function updateOperation(id: string, key: string, value: string) {
    const payload: AnyRow = { [key]: value }
    if ((key === 'driver_name' || key === 'vehicle_plate') && value) payload.operation_status = 'confirmed'
    if (key === 'meeting_status' && value === 'completed') payload.operation_status = 'completed'
    const { error } = await supabase.from('reservations').update(payload).eq('id', id)
    if (error) return alert(error.message)
    await loadAll()
  }

  async function saveFinance() {
    if (!financeForm.amount) return alert('Tutar gir')
    const { error } = await supabase.from('finance_transactions').insert([{ ...financeForm, amount: Number(financeForm.amount), currency: 'USD' }])
    if (error) return alert(error.message)
    setFinanceForm({ type: 'income', category: 'cash', payment_method: 'cash', related_party: '', amount: '', transaction_date: today, description: '' })
    await loadAll()
  }

  async function deleteFinance(id: string) {
    if (!confirm('Bu muhasebe kaydı silinsin mi?')) return
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
    if (error) return alert(error.message)
    await loadAll()
  }

  async function addOrUpdateDefinition(tableName: string) {
    const value = definitionInputs[tableName] || ''
    if (!value.trim()) return alert('Boş kayıt olmaz')
    const payload: AnyRow = tableName === 'vehicles' ? { plate: value } : { name: value }
    if (tableName === 'vehicle_types') payload.capacity = 4
    const query = definitionEdit?.table === tableName
      ? supabase.from(tableName as any).update(payload).eq('id', definitionEdit.id)
      : supabase.from(tableName as any).insert([payload])
    const { error } = await query
    if (error) return alert(error.message)
    setDefinitionEdit(null)
    setDefinitionInputs((old) => ({ ...old, [tableName]: '' }))
    await loadAll()
  }

  async function deleteDefinition(tableName: string, id: string) {
    if (!confirm('Bu kaydı silmek istiyor musun?')) return
    const { error } = await supabase.from(tableName as any).delete().eq('id', id)
    if (error) return alert(error.message)
    await loadAll()
  }

  function startDefinitionEdit(tableName: string, item: AnyRow) {
    setDefinitionEdit({ table: tableName, id: item.id })
    setDefinitionInputs((old) => ({ ...old, [tableName]: tableName === 'vehicles' ? (item.plate || '') : (item.name || '') }))
  }

  async function saveCompanySettings() {
    const payload = { company_name: companySettings.company_name, whatsapp: companySettings.whatsapp, email: companySettings.email, address: companySettings.address }
    const { error } = companySettings.id
      ? await supabase.from('company_settings').update(payload).eq('id', companySettings.id)
      : await supabase.from('company_settings').insert([payload])
    if (error) return alert(error.message)
    alert('Şirket ayarları kaydedildi')
    await loadAll()
  }

  function exportCsv(rows: AnyRow[], filename: string) {
    const headers = ['Voucher', 'Hizmet', 'Tarih', 'Müşteri', 'Telefon', 'Acente', 'Otel', 'Bölge', 'Uçuş', 'Pickup', 'PAX', 'Araç', 'Şoför', 'Plaka', 'Durum', 'Satış', 'Maliyet', 'Kar', 'Not']
    const csvRows = rows.map((r) => [r.reservation_code, serviceTitle(r), r.service_date, r.customer_name, r.customer_phone, r.agency_name, r.hotel_name, r.region_name, r.flight_code, r.pickup_location, r.pax_adult, r.vehicle_type, r.driver_name, r.vehicle_plate, r.operation_status, r.sale_amount, r.cost_amount, Number(r.sale_amount || 0) - Number(r.cost_amount || 0), r.notes])
    const csv = [headers, ...csvRows].map((row) => row.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function sendWhatsApp(groupCode: string) {
    const group = voucherGroups.find((g) => g.code === groupCode)
    if (!group) return
    const first = group.first
    const phone = compactPhone(first.customer_phone || '')
    if (!phone) return alert('WhatsApp için telefon numarası yok')
    const lines = group.rows.map((r, i) => `${i + 1}) ${serviceTitle(r)} - ${r.service_date || '-'} - ${r.pickup_location || '-'} ${r.flight_code ? `- Flight: ${r.flight_code}` : ''}`).join('\n')
    const text = `${companySettings.company_name || 'YU Travel'} Voucher\nVoucher No: ${group.code}\nGuest: ${first.customer_name || '-'}\nPAX: ${first.pax_adult || '-'}\nHotel: ${first.hotel_name || '-'}\n\nServices:\n${lines}\n\nThank you for choosing ${companySettings.company_name || 'YU Travel'}.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  function printVoucher(groupCode: string) {
    const group = voucherGroups.find((g) => g.code === groupCode)
    if (!group) return
    const first = group.first
    const serviceRows = group.rows.map((r, i) => `<tr><td>${i + 1}</td><td>${serviceTitle(r)}</td><td>${r.service_date || '-'}</td><td>${r.flight_code || '-'}</td><td>${r.pickup_location || '-'}</td><td>${r.hotel_name || '-'}</td><td>${r.vehicle_type || '-'}</td><td>${r.notes || '-'}</td></tr>`).join('')
    const html = `
      <html><head><title>${group.code}</title><style>
      body{font-family:Arial,sans-serif;padding:28px;color:#111827}.voucher{border:2px solid #111827}.header{display:grid;grid-template-columns:150px 1fr 220px;border-bottom:2px solid #111827;align-items:center}.logoBox{padding:16px;border-right:2px solid #111827;text-align:center}.logoBox img{width:110px;height:110px;object-fit:contain}.title{text-align:center}.title h1{margin:0;font-size:28px}.title h2{margin:8px 0 0;color:#0EA5E9}.meta{border-left:2px solid #111827;font-size:13px}.meta div{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #111827}.meta span{padding:8px}.section{background:#EAF7FC;font-weight:bold;padding:8px 12px;border-top:2px solid #111827;border-bottom:1px solid #111827}table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #111827;padding:8px;vertical-align:top}th{background:#F3F4F6;text-align:left}.box{padding:12px;min-height:60px}.footer{display:grid;grid-template-columns:1fr 1fr;border-top:2px solid #111827}.footer div{padding:12px}.footer div:first-child{border-right:2px solid #111827}@media print{body{padding:0}}
      </style></head><body><div class="voucher">
      <div class="header"><div class="logoBox"><img src="/logo.png" /></div><div class="title"><h1>VOUCHER FORM</h1><h2>${companySettings.company_name || 'YU TRAVEL'}</h2><p>Incoming Tourism Services</p></div><div class="meta"><div><span><b>Voucher No</b></span><span>${group.code}</span></div><div><span><b>Agency</b></span><span>${first.agency_name || '-'}</span></div><div><span><b>Date</b></span><span>${new Date().toLocaleDateString('tr-TR')}</span></div></div></div>
      <div class="section">Customer / Pax Information</div><table><tr><th>Customer</th><th>PAX</th><th>Phone</th><th>Hotel</th><th>Region</th></tr><tr><td>${first.customer_name || '-'}</td><td>${first.pax_adult || '-'}</td><td>${first.customer_phone || '-'}</td><td>${first.hotel_name || '-'}</td><td>${first.region_name || '-'}</td></tr></table>
      <div class="section">Services</div><table><tr><th>#</th><th>Service</th><th>Date</th><th>Flight</th><th>Pickup</th><th>Hotel</th><th>Vehicle</th><th>Note</th></tr>${serviceRows}</table>
      <div class="section">Notes</div><div class="box">${first.notes || '-'}</div>
      <div class="footer"><div><b>Confirmation Date</b><br/>${new Date().toLocaleDateString('tr-TR')}</div><div><b>${companySettings.company_name || 'YU Travel'} Contact</b><br/>${companySettings.address || 'Antalya / Türkiye'}<br/>WhatsApp: ${companySettings.whatsapp || '-'}<br/>Email: ${companySettings.email || '-'}</div></div>
      </div></body></html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.print()
  }

  if (loginLoading) return <div style={styles.loading}>YU Travel yükleniyor...</div>
  if (!session) return <LoginScreen email={loginEmail} setEmail={setLoginEmail} password={loginPassword} setPassword={setLoginPassword} login={login} loading={loginLoading} />

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <img src="/logo.png" alt="YU Travel" style={styles.logo} />
        <div style={styles.brand}>YU Travel ERP</div>
        <div style={styles.subtitle}>Reservation • Operation • Tours</div>
        <nav style={{ marginTop: 24 }}>
          {tabList.map((tab) => <button key={tab} onClick={() => setActive(tab)} style={{ ...styles.navBtn, ...(active === tab ? styles.navBtnActive : {}) }}>{tab}</button>)}
        </nav>
        <button onClick={logout} style={styles.logout}>Çıkış</button>
      </aside>
      <main style={styles.main}>
        <header style={styles.topbar}>
          <div><h1 style={styles.pageTitle}>{active}</h1><p style={styles.muted}>Tek voucher, parçalı operasyon, sade inbound acente sistemi</p></div>
          <button onClick={loadAll} style={styles.secondaryBtn}>Yenile</button>
        </header>
        {active === 'Dashboard' && <Dashboard todayCount={dashboardToday.length} voucherCount={voucherGroups.length} operationCount={reservations.length} sales={totalSales} cost={totalCost} balance={financeBalance} rows={dashboardToday} setActive={setActive} />}
        {active === 'Rezervasyonlar' && <ReservationsScreen form={reservationForm} update={updateReservation} services={services} updateService={updateService} save={saveReservation} lists={{ agencies, hotels, regions, vehicleTypes, tours, packages, roomTypes, boardTypes, extraServices }} vouchers={filteredVouchers} search={search} setSearch={setSearch} selectedVoucher={selectedVoucher} setSelectedVoucher={setSelectedVoucher} selectedRows={selectedVoucherRows} printVoucher={printVoucher} sendWhatsApp={sendWhatsApp} deleteVoucher={deleteVoucher} />}
        {active === 'Operasyon' && <OperationScreen rows={operationRows} opFrom={opFrom} setOpFrom={setOpFrom} opTo={opTo} setOpTo={setOpTo} opType={opType} setOpType={setOpType} opStatus={opStatus} setOpStatus={setOpStatus} drivers={drivers} fleet={fleet} updateOperation={updateOperation} deleteOperation={deleteOperation} exportCsv={() => exportCsv(operationRows, `YU-Travel-Operasyon-${opFrom}-${opTo}.csv`)} />}
        {active === 'Turlar' && <DefinitionsPanel title="Turlar" items={tours} table="tours" input={definitionInputs.tours || ''} setInput={(v) => setDefinitionInputs((o) => ({ ...o, tours: v }))} save={() => addOrUpdateDefinition('tours')} edit={startDefinitionEdit} del={deleteDefinition} placeholder="Yeni tur adı" />}
        {active === 'Faturalama' && <FinanceScreen form={financeForm} setForm={setFinanceForm} save={saveFinance} rows={finance} del={deleteFinance} totalSales={totalSales} totalCost={totalCost} balance={financeBalance} />}
        {active === 'Oteller & Servisler' && <MastersScreen data={{ agencies, regions, hotels, vehicleTypes, drivers, fleet, tours, packages, roomTypes, boardTypes, extraServices }} inputs={definitionInputs} setInputs={setDefinitionInputs} save={addOrUpdateDefinition} edit={startDefinitionEdit} del={deleteDefinition} />}
        {active === 'Yönetimsel Raporlar' && <ReportsScreen from={reportFrom} setFrom={setReportFrom} to={reportTo} setTo={setReportTo} rows={reportRows} vouchers={voucherGroups} exportCsv={() => exportCsv(reportRows, `YU-Travel-Rapor-${reportFrom}-${reportTo}.csv`)} />}
        {active === 'Ayarlar' && <SettingsScreen settings={companySettings} setSettings={setCompanySettings} save={saveCompanySettings} />}
      </main>
    </div>
  )
}

function LoginScreen({ email, setEmail, password, setPassword, login, loading }: any) {
  return <div style={styles.loginPage}><div style={styles.loginCard}><img src="/logo.png" style={styles.loginLogo} alt="YU Travel" /><h1>YU Travel ERP</h1><p style={styles.muted}>Giriş yap</p><input style={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input style={styles.input} type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') login() }} /><button onClick={login} style={styles.primaryBtn}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button></div></div>
}

function Dashboard({ todayCount, voucherCount, operationCount, sales, cost, balance, rows, setActive }: any) {
  return <div><div style={styles.grid4}><Stat title="Bugünkü İş" value={todayCount} /><Stat title="Toplam Voucher" value={voucherCount} /><Stat title="Operasyon Satırı" value={operationCount} /><Stat title="Kasa Bakiye" value={`$${money(balance)}`} /></div><div style={styles.grid3}><Stat title="Toplam Satış" value={`$${money(sales)}`} /><Stat title="Toplam Maliyet" value={`$${money(cost)}`} /><Stat title="Brüt Kâr" value={`$${money(sales - cost)}`} /></div><section style={styles.card}><div style={styles.cardHead}><h2>Bugünkü Operasyon</h2><button style={styles.secondaryBtn} onClick={() => setActive('Operasyon')}>Operasyona Git</button></div><MiniTable rows={rows} /></section></div>
}

function ReservationsScreen({ form, update, services, updateService, save, lists, vouchers, search, setSearch, selectedVoucher, setSelectedVoucher, selectedRows, printVoucher, sendWhatsApp, deleteVoucher }: any) {
  const totals = services.filter((s: ServiceDraft) => s.enabled).reduce((acc: any, s: ServiceDraft) => ({ sale: acc.sale + Number(s.sale || 0), cost: acc.cost + Number(s.cost || 0) }), { sale: 0, cost: 0 })
  return <div style={styles.grid2wide}>
    <section style={styles.card}><h2>Yeni Rezervasyon</h2><p style={styles.muted}>Önce rezervasyon tipini seç, sonra hizmetleri işaretle. Tek voucher oluşur, her hizmet operasyona ayrı düşer.</p>
      <div style={styles.formGrid}><Select label="Rezervasyon Tipi" value={form.reservation_type} onChange={(v) => update('reservation_type', v)} options={reservationTypeOptions} /><Input label="Müşteri" value={form.customer_name} onChange={(v) => update('customer_name', v)} /><Input label="Telefon / WhatsApp" value={form.customer_phone} onChange={(v) => update('customer_phone', v)} /><Select label="Acente" value={form.agency_name} onChange={(v) => update('agency_name', v)} options={lists.agencies.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /><Select label="Otel" value={form.hotel_name} onChange={(v) => update('hotel_name', v)} options={lists.hotels.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /><Select label="Bölge" value={form.region_name} onChange={(v) => update('region_name', v)} options={lists.regions.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /><Input label="PAX" value={form.pax_adult} onChange={(v) => update('pax_adult', v)} type="number" /><Select label="Araç Tipi" value={form.vehicle_type} onChange={(v) => update('vehicle_type', v)} options={lists.vehicleTypes.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /><Select label="Oda Tipi" value={form.room_type} onChange={(v) => update('room_type', v)} options={lists.roomTypes.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /><Select label="Pansiyon" value={form.board_type} onChange={(v) => update('board_type', v)} options={lists.boardTypes.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /><Select label="Ödeme" value={form.payment_status} onChange={(v) => update('payment_status', v)} options={[{ value: 'unpaid', label: 'Ödenmedi' }, { value: 'partial', label: 'Kısmi' }, { value: 'paid', label: 'Ödendi' }, { value: 'agency', label: 'Acenteden Alınacak' }]} /><Select label="Operasyon Durumu" value={form.operation_status} onChange={(v) => update('operation_status', v)} options={[{ value: 'option', label: 'Opsiyon' }, { value: 'confirmed', label: 'Onaylandı' }, { value: 'completed', label: 'Tamamlandı' }, { value: 'cancelled', label: 'İptal' }]} /></div>
      <Textarea label="Genel Not" value={form.notes} onChange={(v) => update('notes', v)} />
      <h3>Hizmetler</h3>{services.map((s: ServiceDraft) => <ServiceCard key={s.uid} service={s} update={(key: keyof ServiceDraft, value: any) => updateService(s.uid, key, value)} lists={lists} />)}
      <div style={styles.summaryBar}><b>Toplam Satış: ${money(totals.sale)}</b><b>Toplam Maliyet: ${money(totals.cost)}</b><b>Kâr: ${money(totals.sale - totals.cost)}</b></div><button onClick={save} style={styles.primaryBtn}>Rezervasyonu Kaydet</button>
    </section>
    <section style={styles.card}><div style={styles.cardHead}><h2>Voucherlar</h2><input style={styles.search} placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div style={{ overflowX: 'auto' }}><table style={styles.table}><thead><tr><th>Voucher</th><th>Müşteri</th><th>Servis</th><th>Satış</th><th>Kar</th><th>İşlem</th></tr></thead><tbody>{vouchers.map((g: any) => <tr key={g.code} style={selectedVoucher === g.code ? styles.selectedRow : undefined}><td><button style={styles.linkBtn} onClick={() => setSelectedVoucher(g.code)}>{g.code}</button></td><td>{g.first.customer_name}<br/><small>{g.first.agency_name}</small></td><td>{g.rows.length} hizmet</td><td>${money(g.sale)}</td><td>${money(g.profit)}</td><td><button style={styles.smallBtn} onClick={() => printVoucher(g.code)}>Voucher</button><button style={styles.smallBtn} onClick={() => sendWhatsApp(g.code)}>WA</button><button style={styles.dangerSmall} onClick={() => deleteVoucher(g.code)}>Sil</button></td></tr>)}</tbody></table></div>{selectedVoucher && <div style={styles.detailBox}><h3>{selectedVoucher} Hizmetleri</h3><MiniTable rows={selectedRows} /></div>}</section>
  </div>
}

function ServiceCard({ service, update, lists }: any) {
  return <div style={styles.serviceCard}><label style={styles.checkLine}><input type="checkbox" checked={service.enabled} onChange={(e) => update('enabled', e.target.checked)} /><b>{service.label}</b></label>{service.enabled && <div style={styles.formGrid}><Input label="Tarih" type="date" value={service.date} onChange={(v) => update('date', v)} /><Input label="Saat" type="time" value={service.time} onChange={(v) => update('time', v)} />{service.kind === 'tour' ? <Select label="Tur" value={service.name} onChange={(v) => update('name', v)} options={lists.tours.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /> : service.kind === 'hotel' ? <Select label="Otel / Konaklama" value={service.name} onChange={(v) => update('name', v)} options={lists.hotels.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /> : service.kind === 'extra' ? <Select label="Ekstra Servis" value={service.name} onChange={(v) => update('name', v)} options={lists.extraServices.map((x: AnyRow) => ({ value: x.name, label: x.name }))} /> : <Input label="Servis Adı" value={service.name} onChange={(v) => update('name', v)} />}{['arrival','departure','flight'].includes(service.kind) && <Input label="Uçuş / Bilet No" value={service.flight} onChange={(v) => update('flight', v)} />}<Input label="Alış Noktası" value={service.pickup} onChange={(v) => update('pickup', v)} /><Input label="Varış Noktası" value={service.dropoff} onChange={(v) => update('dropoff', v)} /><Input label="Satış" type="number" value={service.sale} onChange={(v) => update('sale', v)} /><Input label="Maliyet" type="number" value={service.cost} onChange={(v) => update('cost', v)} /><Input label="Tedarikçi" value={service.supplier} onChange={(v) => update('supplier', v)} /><Input label="Not" value={service.note} onChange={(v) => update('note', v)} /></div>}</div>
}

function OperationScreen({ rows, opFrom, setOpFrom, opTo, setOpTo, opType, setOpType, opStatus, setOpStatus, drivers, fleet, updateOperation, deleteOperation, exportCsv }: any) {
  return <section style={styles.card}><div style={styles.cardHead}><h2>Operasyon Planı</h2><button style={styles.secondaryBtn} onClick={exportCsv}>Excel / CSV</button></div><div style={styles.filters}><Input label="Başlangıç" type="date" value={opFrom} onChange={setOpFrom} /><Input label="Bitiş" type="date" value={opTo} onChange={setOpTo} /><Select label="Tip" value={opType} onChange={setOpType} options={[{ value: 'all', label: 'Tümü' }, { value: 'arrival', label: 'Geliş' }, { value: 'departure', label: 'Dönüş' }, { value: 'tour', label: 'Tur' }, { value: 'hotel', label: 'Otel' }, { value: 'flight', label: 'Uçak' }, { value: 'extra', label: 'Ekstra' }]} /><Select label="Durum" value={opStatus} onChange={setOpStatus} options={[{ value: 'all', label: 'Tümü' }, { value: 'option', label: 'Opsiyon' }, { value: 'confirmed', label: 'Onaylandı' }, { value: 'completed', label: 'Tamamlandı' }, { value: 'cancelled', label: 'İptal' }]} /></div><div style={{ overflowX: 'auto' }}><table style={styles.table}><thead><tr><th>Tarih</th><th>Voucher</th><th>Tip</th><th>Müşteri</th><th>Pickup</th><th>Otel/Tur</th><th>Şoför</th><th>Plaka</th><th>Durum</th><th>Not</th><th></th></tr></thead><tbody>{rows.map((r: AnyRow) => <tr key={r.id}><td>{r.service_date}</td><td>{r.reservation_code}</td><td>{operationLabel(r.operation_type)}</td><td>{r.customer_name}<br/><small>{r.customer_phone}</small></td><td>{r.pickup_location}<br/><small>{r.flight_code}</small></td><td>{serviceTitle(r)}<br/><small>{r.hotel_name}</small></td><td><select style={styles.cellSelect} value={r.driver_name || ''} onChange={(e) => updateOperation(r.id, 'driver_name', e.target.value)}><option value="">Seç</option>{drivers.map((d: AnyRow) => <option key={d.id} value={d.name}>{d.name}</option>)}</select></td><td><select style={styles.cellSelect} value={r.vehicle_plate || ''} onChange={(e) => updateOperation(r.id, 'vehicle_plate', e.target.value)}><option value="">Seç</option>{fleet.map((f: AnyRow) => <option key={f.id} value={f.plate}>{f.plate}</option>)}</select></td><td><select style={styles.cellSelect} value={r.operation_status || 'option'} onChange={(e) => updateOperation(r.id, 'operation_status', e.target.value)}><option value="option">Opsiyon</option><option value="confirmed">Onaylandı</option><option value="completed">Tamamlandı</option><option value="cancelled">İptal</option></select></td><td><input style={styles.cellInput} value={r.operation_note || ''} onChange={(e) => updateOperation(r.id, 'operation_note', e.target.value)} placeholder="Not" /></td><td><button style={styles.dangerSmall} onClick={() => deleteOperation(r.id)}>Sil</button></td></tr>)}</tbody></table></div></section>
}

function FinanceScreen({ form, setForm, save, rows, del, totalSales, totalCost, balance }: any) {
  return <div><div style={styles.grid3}><Stat title="Rezervasyon Satışı" value={`$${money(totalSales)}`} /><Stat title="Rezervasyon Maliyeti" value={`$${money(totalCost)}`} /><Stat title="Kasa Bakiye" value={`$${money(balance)}`} /></div><section style={styles.card}><h2>Faturalama / Muhasebe</h2><div style={styles.formGrid}><Select label="Tip" value={form.type} onChange={(v) => setForm((o: any) => ({ ...o, type: v }))} options={[{ value: 'income', label: 'Gelir' }, { value: 'expense', label: 'Gider' }]} /><Select label="Kategori" value={form.category} onChange={(v) => setForm((o: any) => ({ ...o, category: v }))} options={[{ value: 'cash', label: 'Nakit' }, { value: 'agency', label: 'Acente' }, { value: 'supplier', label: 'Tedarikçi' }, { value: 'hotel', label: 'Otel' }, { value: 'tour', label: 'Tur' }]} /><Input label="İlgili Kişi/Kurum" value={form.related_party} onChange={(v) => setForm((o: any) => ({ ...o, related_party: v }))} /><Input label="Tutar" type="number" value={form.amount} onChange={(v) => setForm((o: any) => ({ ...o, amount: v }))} /><Input label="Tarih" type="date" value={form.transaction_date} onChange={(v) => setForm((o: any) => ({ ...o, transaction_date: v }))} /><Input label="Açıklama" value={form.description} onChange={(v) => setForm((o: any) => ({ ...o, description: v }))} /></div><button style={styles.primaryBtn} onClick={save}>Kaydet</button><table style={styles.table}><thead><tr><th>Tarih</th><th>Tip</th><th>Kategori</th><th>İlgili</th><th>Tutar</th><th>Açıklama</th><th></th></tr></thead><tbody>{rows.map((f: AnyRow) => <tr key={f.id}><td>{f.transaction_date}</td><td>{f.type}</td><td>{f.category}</td><td>{f.related_party}</td><td>{f.type === 'expense' ? '-' : ''}${money(f.amount)}</td><td>{f.description}</td><td><button style={styles.dangerSmall} onClick={() => del(f.id)}>Sil</button></td></tr>)}</tbody></table></section></div>
}

function MastersScreen({ data, inputs, setInputs, save, edit, del }: any) {
  const panels = [
    ['Acenteler', 'agencies', data.agencies, 'Yeni acente'], ['Bölgeler', 'regions', data.regions, 'Yeni bölge'], ['Oteller', 'hotels', data.hotels, 'Yeni otel'], ['Araç Tipleri', 'vehicle_types', data.vehicleTypes, 'Yeni araç tipi'], ['Şoförler', 'drivers', data.drivers, 'Yeni şoför'], ['Araç Plakaları', 'vehicles', data.fleet, 'Yeni plaka'], ['Turlar', 'tours', data.tours, 'Yeni tur'], ['Paketler', 'packages', data.packages, 'Yeni paket'], ['Oda Tipleri', 'room_types', data.roomTypes, 'Yeni oda tipi'], ['Pansiyon Tipleri', 'board_types', data.boardTypes, 'Yeni pansiyon'], ['Ek Servisler', 'extra_services', data.extraServices, 'Yeni ek servis'],
  ]
  return <div style={styles.masterGrid}>{panels.map(([title, table, items, placeholder]: any) => <DefinitionsPanel key={table} title={title} table={table} items={items} input={inputs[table] || ''} setInput={(v: string) => setInputs((o: any) => ({ ...o, [table]: v }))} save={() => save(table)} edit={edit} del={del} placeholder={placeholder} />)}</div>
}

function DefinitionsPanel({ title, items, table, input, setInput, save, edit, del, placeholder }: any) {
  return <section style={styles.card}><h2>{title}</h2><div style={styles.inlineForm}><input style={styles.input} placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} /><button style={styles.primaryBtn} onClick={save}>Kaydet</button></div><div>{items.map((item: AnyRow) => <div key={item.id} style={styles.listItem}><span>{table === 'vehicles' ? item.plate : item.name}</span><span><button style={styles.smallBtn} onClick={() => edit(table, item)}>Düzenle</button><button style={styles.dangerSmall} onClick={() => del(table, item.id)}>Sil</button></span></div>)}</div></section>
}

function ReportsScreen({ from, setFrom, to, setTo, rows, vouchers, exportCsv }: any) {
  const sale = rows.reduce((s: number, r: AnyRow) => s + Number(r.sale_amount || 0), 0)
  const cost = rows.reduce((s: number, r: AnyRow) => s + Number(r.cost_amount || 0), 0)
  const byAgency = Object.values(rows.reduce((acc: any, r: AnyRow) => { const k = r.agency_name || 'Belirsiz'; acc[k] ||= { agency: k, count: 0, sale: 0, cost: 0 }; acc[k].count += 1; acc[k].sale += Number(r.sale_amount || 0); acc[k].cost += Number(r.cost_amount || 0); return acc }, {})) as AnyRow[]
  return <div><div style={styles.filters}><Input label="Başlangıç" type="date" value={from} onChange={setFrom} /><Input label="Bitiş" type="date" value={to} onChange={setTo} /><button style={styles.secondaryBtn} onClick={exportCsv}>Raporu Excel/CSV Al</button></div><div style={styles.grid4}><Stat title="Servis Sayısı" value={rows.length} /><Stat title="Voucher Sayısı" value={vouchers.length} /><Stat title="Satış" value={`$${money(sale)}`} /><Stat title="Kâr" value={`$${money(sale - cost)}`} /></div><section style={styles.card}><h2>Acente Performansı</h2><table style={styles.table}><thead><tr><th>Acente</th><th>İş</th><th>Satış</th><th>Maliyet</th><th>Kar</th></tr></thead><tbody>{byAgency.map((a) => <tr key={a.agency}><td>{a.agency}</td><td>{a.count}</td><td>${money(a.sale)}</td><td>${money(a.cost)}</td><td>${money(a.sale - a.cost)}</td></tr>)}</tbody></table></section><section style={styles.card}><h2>Detay Rapor</h2><MiniTable rows={rows} /></section></div>
}

function SettingsScreen({ settings, setSettings, save }: any) {
  return <section style={styles.card}><h2>Şirket Bilgileri</h2><div style={styles.formGrid}><Input label="Şirket Adı" value={settings.company_name || ''} onChange={(v) => setSettings((o: any) => ({ ...o, company_name: v }))} /><Input label="WhatsApp" value={settings.whatsapp || ''} onChange={(v) => setSettings((o: any) => ({ ...o, whatsapp: v }))} /><Input label="Email" value={settings.email || ''} onChange={(v) => setSettings((o: any) => ({ ...o, email: v }))} /><Input label="Adres" value={settings.address || ''} onChange={(v) => setSettings((o: any) => ({ ...o, address: v }))} /></div><button style={styles.primaryBtn} onClick={save}>Ayarları Kaydet</button></section>
}

function MiniTable({ rows }: any) {
  if (!rows.length) return <p style={styles.muted}>Kayıt yok.</p>
  return <div style={{ overflowX: 'auto' }}><table style={styles.table}><thead><tr><th>Tarih</th><th>Voucher</th><th>Hizmet</th><th>Müşteri</th><th>Pickup</th><th>Satış</th><th>Durum</th></tr></thead><tbody>{rows.map((r: AnyRow) => <tr key={r.id}><td>{r.service_date}</td><td>{r.reservation_code}</td><td>{serviceTitle(r)}</td><td>{r.customer_name}</td><td>{r.pickup_location}</td><td>${money(r.sale_amount)}</td><td>{r.operation_status}</td></tr>)}</tbody></table></div>
}

function Stat({ title, value }: any) { return <div style={styles.stat}><span>{title}</span><b>{value}</b></div> }
function Input({ label, value, onChange, type = 'text' }: any) { return <label style={styles.label}><span>{label}</span><input style={styles.input} type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} /></label> }
function Textarea({ label, value, onChange }: any) { return <label style={styles.labelFull}><span>{label}</span><textarea style={styles.textarea} value={value || ''} onChange={(e) => onChange(e.target.value)} /></label> }
function Select({ label, value, onChange, options }: any) { return <label style={styles.label}><span>{label}</span><select style={styles.input} value={value || ''} onChange={(e) => onChange(e.target.value)}><option value="">Seç</option>{options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label> }

const styles: Record<string, any> = {
  app: { display: 'flex', minHeight: '100vh', background: '#F4F7FB', color: '#0F172A' },
  sidebar: { width: 285, background: 'linear-gradient(180deg,#071225,#0B1B3A)', color: 'white', padding: 24, position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box', overflowY: 'auto' },
  logo: { width: 84, height: 84, objectFit: 'contain', background: 'white', borderRadius: 18, padding: 8 },
  brand: { fontSize: 25, fontWeight: 800, marginTop: 12 }, subtitle: { color: '#A7B3C8', fontSize: 13, marginTop: 4 },
  navBtn: { width: '100%', padding: '13px 14px', border: 0, borderRadius: 14, color: 'white', background: 'transparent', textAlign: 'left', marginBottom: 8, cursor: 'pointer', fontWeight: 700 },
  navBtnActive: { background: 'linear-gradient(90deg,#12B7D6,#0EA5E9)', boxShadow: '0 10px 30px rgba(14,165,233,.25)' }, logout: { marginTop: 20, width: '100%', padding: 12, borderRadius: 12, border: '1px solid #334155', background: '#0F172A', color: 'white', cursor: 'pointer' },
  main: { flex: 1, padding: 28, overflow: 'auto' }, topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }, pageTitle: { margin: 0, fontSize: 30 }, muted: { color: '#64748B', margin: '6px 0 14px' },
  loading: { padding: 40, fontSize: 24 }, loginPage: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#071225,#0EA5E9)' }, loginCard: { background: 'white', width: 380, borderRadius: 26, padding: 32, boxShadow: '0 30px 80px rgba(0,0,0,.25)' }, loginLogo: { width: 100, height: 100, objectFit: 'contain' },
  card: { background: 'white', borderRadius: 22, padding: 22, boxShadow: '0 8px 30px rgba(15,23,42,.07)', marginBottom: 20 }, cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 20 }, grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginBottom: 20 }, grid2wide: { display: 'grid', gridTemplateColumns: 'minmax(520px,1.25fr) minmax(420px,.9fr)', gap: 20, alignItems: 'start' }, masterGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18 },
  stat: { background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 8px 30px rgba(15,23,42,.07)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }, filters: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end', background: 'white', padding: 18, borderRadius: 18, marginBottom: 18 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }, labelFull: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155', marginTop: 12 },
  input: { border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 13px', fontSize: 14, background: 'white', minWidth: 0 }, search: { border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 13px', fontSize: 14, minWidth: 210 }, textarea: { border: '1px solid #CBD5E1', borderRadius: 12, padding: 12, minHeight: 72 },
  primaryBtn: { background: 'linear-gradient(90deg,#0EA5E9,#12B7D6)', color: 'white', border: 0, borderRadius: 14, padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }, secondaryBtn: { background: '#E0F2FE', color: '#0369A1', border: 0, borderRadius: 14, padding: '12px 18px', fontWeight: 800, cursor: 'pointer' }, smallBtn: { background: '#E0F2FE', color: '#0369A1', border: 0, borderRadius: 10, padding: '8px 10px', margin: 2, fontWeight: 700, cursor: 'pointer' }, dangerSmall: { background: '#FEE2E2', color: '#B91C1C', border: 0, borderRadius: 10, padding: '8px 10px', margin: 2, fontWeight: 700, cursor: 'pointer' }, linkBtn: { background: 'transparent', border: 0, color: '#0284C7', fontWeight: 900, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 }, selectedRow: { background: '#E0F2FE' }, detailBox: { background: '#F8FAFC', borderRadius: 16, padding: 14, marginTop: 14 },
  serviceCard: { border: '1px solid #E2E8F0', borderRadius: 18, padding: 14, marginBottom: 12, background: '#FBFDFF' }, checkLine: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }, summaryBar: { display: 'flex', gap: 16, flexWrap: 'wrap', padding: 14, borderRadius: 16, background: '#F0F9FF', margin: '14px 0' },
  cellSelect: { width: 120, padding: 8, borderRadius: 10, border: '1px solid #CBD5E1' }, cellInput: { width: 140, padding: 8, borderRadius: 10, border: '1px solid #CBD5E1' },
  inlineForm: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 12 }, listItem: { display: 'flex', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid #E2E8F0' },
}
