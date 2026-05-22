'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Page() {
  const today = new Date().toISOString().slice(0, 10)

  const [session, setSession] = useState<any>(null)
  const [loginLoading, setLoginLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [active, setActive] = useState('Dashboard')
  const [reservations, setReservations] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [fleet, setFleet] = useState<any[]>([])
  const [finance, setFinance] = useState<any[]>([])

  const [companySettings, setCompanySettings] = useState<any>({
    company_name: 'YU Travel',
    whatsapp: '+90 535 764 54 08',
    email: 'info@yutravel.com',
    address: 'Antalya / Türkiye',
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [definitionEdit, setDefinitionEdit] = useState<any>(null)

  const [reservationSearch, setReservationSearch] = useState('')
  const [filterAgency, setFilterAgency] = useState('all')
  const [filterHotel, setFilterHotel] = useState('all')
  const [filterRegion, setFilterRegion] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [filterOperationStatus, setFilterOperationStatus] = useState('all')
  const [filterOperationType, setFilterOperationType] = useState('all')

  const [reportFrom, setReportFrom] = useState(today)
  const [reportTo, setReportTo] = useState(today)
  const [reportType, setReportType] = useState('all')
  const [operationDate, setOperationDate] = useState(today)
  const [operationTypeFilter, setOperationTypeFilter] = useState('all')

  const emptyForm = {
    customer_name: '',
    customer_phone: '',
    agency_name: '',
    hotel_name: '',
    region_name: '',
    operation_type: 'arrival',
    service_date: today,
    flight_code: '',
    pickup_location: 'Antalya Airport',
    return_date: '',
    return_flight_code: '',
    return_pickup_location: '',
    pax_adult: '1',
    vehicle_type: '',
    sale_amount: '',
    cost_amount: '',
    payment_status: 'unpaid',
    operation_status: 'option',
    notes: '',
  }

  const [form, setForm] = useState(emptyForm)

  const [financeForm, setFinanceForm] = useState({
    type: 'income',
    category: 'cash',
    payment_method: 'cash',
    related_party: '',
    amount: '',
    transaction_date: today,
    description: '',
  })

  const [newAgency, setNewAgency] = useState('')
  const [newRegion, setNewRegion] = useState('')
  const [newHotel, setNewHotel] = useState('')
  const [newVehicleType, setNewVehicleType] = useState('')
  const [newDriver, setNewDriver] = useState('')
  const [newPlate, setNewPlate] = useState('')

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

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    setLoginLoading(false)

    if (error) return alert(error.message)

    loadAll()
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  async function loadAll() {
    const res = await supabase.from('reservations').select('*').order('created_at', { ascending: false })
    const ag = await supabase.from('agencies').select('*').order('created_at', { ascending: false })
    const rg = await supabase.from('regions').select('*').order('created_at', { ascending: false })
    const ht = await supabase.from('hotels').select('*').order('created_at', { ascending: false })
    const vt = await supabase.from('vehicle_types').select('*').order('created_at', { ascending: false })
    const dr = await supabase.from('drivers').select('*').order('created_at', { ascending: false })
    const fl = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    const fn = await supabase.from('finance_transactions').select('*').order('transaction_date', { ascending: false })
    const cs = await supabase.from('company_settings').select('*').limit(1).maybeSingle()

    if (res.data) setReservations(res.data)
    if (ag.data) setAgencies(ag.data)
    if (rg.data) setRegions(rg.data)
    if (ht.data) setHotels(ht.data)
    if (vt.data) setVehicleTypes(vt.data)
    if (dr.data) setDrivers(dr.data)
    if (fl.data) setFleet(fl.data)
    if (fn.data) setFinance(fn.data)
    if (cs.data) setCompanySettings(cs.data)
  }

  function update(key: string, value: string) {
    setForm((old) => ({ ...old, [key]: value }))
  }

  function updateFinance(key: string, value: string) {
    setFinanceForm((old) => ({ ...old, [key]: value }))
  }

  function updateCompanySetting(key: string, value: string) {
    setCompanySettings((old: any) => ({ ...old, [key]: value }))
  }

  function nextVoucherNo() {
    const nums = reservations
      .map((r) => {
        const match = String(r.reservation_code || '').match(/YU(\d+)/)
        return match ? Number(match[1]) : NaN
      })
      .filter((n) => !isNaN(n))

    const next = nums.length ? Math.max(...nums) + 1 : 1
    return 'YU' + String(next).padStart(2, '0')
  }

  function clearForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function saveReservation() {
    const sale = Number(form.sale_amount || 0)
    const cost = Number(form.cost_amount || 0)
    const pax = Number(form.pax_adult || 0)

    if (!form.customer_name.trim()) return alert('Müşteri adı zorunlu')
    if (!form.customer_phone.trim()) return alert('Telefon / WhatsApp zorunlu')
    if (!form.agency_name.trim()) return alert('Acente seçmelisin')
    if (!form.hotel_name.trim()) return alert('Otel seçmelisin')
    if (!pax || pax < 1) return alert('PAX en az 1 olmalı')
    if (!form.sale_amount || sale <= 0) return alert('Satış tutarı zorunlu ve 0’dan büyük olmalı')

    if (form.operation_type === 'arrival' && !form.service_date) return alert('Geliş tarihi zorunlu')
    if (form.operation_type === 'departure' && !form.service_date) return alert('Dönüş tarihi zorunlu')

    if (form.operation_type === 'roundtrip') {
      if (!form.service_date) return alert('Geliş tarihi zorunlu')
      if (!form.return_date) return alert('Dönüş tarihi zorunlu')
    }

    if (cost > sale) {
      const ok = confirm('Maliyet satıştan yüksek görünüyor. Yine de kaydetmek istiyor musun?')
      if (!ok) return
    }

    const basePayload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      agency_name: form.agency_name,
      service_type: 'Airport Transfer',
      hotel_name: form.hotel_name,
      region_name: form.region_name,
      pax_adult: pax,
      vehicle_type: form.vehicle_type,
      currency: 'USD',
      payment_status: form.payment_status,
      operation_status: form.operation_status,
      notes: form.notes,
    }

    if (editingId) {
      const payload = {
        ...basePayload,
        operation_type: form.operation_type === 'roundtrip' ? 'arrival' : form.operation_type,
        service_date: form.service_date,
        flight_code: form.flight_code,
        pickup_location: form.pickup_location,
        sale_amount: sale,
        cost_amount: cost,
      }

      const { error } = await supabase.from('reservations').update(payload).eq('id', editingId)
      if (error) return alert(error.message)

      alert('Rezervasyon güncellendi')
      clearForm()
      loadAll()
      return
    }

    const voucherNo = nextVoucherNo()

    if (form.operation_type === 'roundtrip') {
      const halfSale = sale / 2
      const halfCost = cost / 2

      const arrivalPayload = {
        ...basePayload,
        reservation_code: `${voucherNo}-A`,
        operation_type: 'arrival',
        service_date: form.service_date,
        flight_code: form.flight_code,
        pickup_location: form.pickup_location || 'Antalya Airport',
        sale_amount: halfSale,
        cost_amount: halfCost,
        notes: `${form.notes || ''} | Roundtrip rezervasyon: toplam satış $${sale}, toplam maliyet $${cost}`,
      }

      const departurePayload = {
        ...basePayload,
        reservation_code: `${voucherNo}-D`,
        operation_type: 'departure',
        service_date: form.return_date,
        flight_code: form.return_flight_code,
        pickup_location: form.return_pickup_location || form.hotel_name,
        sale_amount: halfSale,
        cost_amount: halfCost,
        notes: `${form.notes || ''} | Roundtrip rezervasyon: toplam satış $${sale}, toplam maliyet $${cost}`,
      }

      const { error } = await supabase.from('reservations').insert([arrivalPayload, departurePayload])
      if (error) return alert(error.message)

      alert(`Geliş + dönüş rezervasyon kaydedildi: ${voucherNo}-A / ${voucherNo}-D`)
    } else {
      const payload = {
        ...basePayload,
        reservation_code: voucherNo,
        operation_type: form.operation_type,
        service_date: form.service_date,
        flight_code: form.flight_code,
        pickup_location: form.pickup_location,
        sale_amount: sale,
        cost_amount: cost,
      }

      const { error } = await supabase.from('reservations').insert([payload])
      if (error) return alert(error.message)

      alert(`Rezervasyon kaydedildi: ${voucherNo}`)
    }

    clearForm()
    loadAll()
  }

  function editReservation(r: any) {
    setEditingId(r.id)
    setActive('Rezervasyonlar')

    setForm({
      customer_name: r.customer_name || '',
      customer_phone: r.customer_phone || '',
      agency_name: r.agency_name || '',
      hotel_name: r.hotel_name || '',
      region_name: r.region_name || '',
      operation_type: r.operation_type || 'arrival',
      service_date: r.service_date || today,
      flight_code: r.flight_code || '',
      pickup_location: r.pickup_location || 'Antalya Airport',
      return_date: '',
      return_flight_code: '',
      return_pickup_location: '',
      pax_adult: String(r.pax_adult || '1'),
      vehicle_type: r.vehicle_type || '',
      sale_amount: String(r.sale_amount || ''),
      cost_amount: String(r.cost_amount || ''),
      payment_status: r.payment_status || 'unpaid',
      operation_status: r.operation_status || 'option',
      notes: r.notes || '',
    })
  }

  async function deleteReservation(id: string) {
    if (!confirm('Bu rezervasyonu silmek istiyor musun?')) return
    const { error } = await supabase.from('reservations').delete().eq('id', id)
    if (error) return alert(error.message)
    loadAll()
  }

  async function updateOperationField(id: string, key: string, value: string) {
    const { error } = await supabase.from('reservations').update({ [key]: value }).eq('id', id)
    if (error) return alert(error.message)
    loadAll()
  }

  async function saveCompanySettings() {
    if (companySettings.id) {
      const { error } = await supabase
        .from('company_settings')
        .update({
          company_name: companySettings.company_name,
          whatsapp: companySettings.whatsapp,
          email: companySettings.email,
          address: companySettings.address,
        })
        .eq('id', companySettings.id)

      if (error) return alert(error.message)
    } else {
      const { error } = await supabase.from('company_settings').insert([
        {
          company_name: companySettings.company_name,
          whatsapp: companySettings.whatsapp,
          email: companySettings.email,
          address: companySettings.address,
        },
      ])

      if (error) return alert(error.message)
    }

    alert('Şirket ayarları kaydedildi')
    loadAll()
  }

  async function addOrUpdateDefinition(tableName: string, value: string, clear: any) {
    if (!value.trim()) return alert('Boş kayıt olmaz')

    if (definitionEdit && definitionEdit.table === tableName) {
      const { error } = await supabase.from(tableName as any).update({ name: value }).eq('id', definitionEdit.id)
      if (error) return alert(error.message)

      setDefinitionEdit(null)
      clear('')
      loadAll()
      return
    }

    const payload: any = { name: value }
    if (tableName === 'vehicle_types') payload.capacity = 4

    const { error } = await supabase.from(tableName as any).insert([payload])
    if (error) return alert(error.message)

    clear('')
    loadAll()
  }

  async function deleteDefinition(tableName: string, id: string) {
    if (!confirm('Bu kaydı silmek istiyor musun?')) return
    const { error } = await supabase.from(tableName as any).delete().eq('id', id)
    if (error) return alert(error.message)
    loadAll()
  }

  function startEditDefinition(tableName: string, item: any, setValue: any) {
    setDefinitionEdit({ table: tableName, id: item.id })
    setValue(item.name)
  }

  async function addOrUpdatePlate() {
    if (!newPlate.trim()) return alert('Plaka gir')

    if (definitionEdit && definitionEdit.table === 'vehicles') {
      const { error } = await supabase.from('vehicles').update({ plate: newPlate }).eq('id', definitionEdit.id)
      if (error) return alert(error.message)

      setDefinitionEdit(null)
      setNewPlate('')
      loadAll()
      return
    }

    const { error } = await supabase.from('vehicles').insert([{ plate: newPlate }])
    if (error) return alert(error.message)

    setNewPlate('')
    loadAll()
  }

  function startEditPlate(item: any) {
    setDefinitionEdit({ table: 'vehicles', id: item.id })
    setNewPlate(item.plate || '')
  }

  async function deletePlate(id: string) {
    if (!confirm('Bu aracı silmek istiyor musun?')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) return alert(error.message)
    loadAll()
  }

  async function saveFinance() {
    if (!financeForm.amount) return alert('Tutar gir')

    const { error } = await supabase.from('finance_transactions').insert([
      {
        type: financeForm.type,
        category: financeForm.category,
        payment_method: financeForm.payment_method,
        related_party: financeForm.related_party,
        amount: Number(financeForm.amount) || 0,
        currency: 'USD',
        transaction_date: financeForm.transaction_date,
        description: financeForm.description,
      },
    ])

    if (error) return alert(error.message)

    alert('Muhasebe kaydı eklendi')

    setFinanceForm({
      type: 'income',
      category: 'cash',
      payment_method: 'cash',
      related_party: '',
      amount: '',
      transaction_date: today,
      description: '',
    })

    loadAll()
  }

  async function deleteFinance(id: string) {
    if (!confirm('Bu muhasebe kaydını silmek istiyor musun?')) return
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
    if (error) return alert(error.message)
    loadAll()
  }

  function sendWhatsApp(r: any) {
    const phone = String(r.customer_phone || '').replaceAll(' ', '').replace('+', '')
    if (!phone) return alert('WhatsApp için telefon numarası yok')

    const text = `
${companySettings.company_name || 'YU Travel'} Voucher
Voucher No: ${r.reservation_code}
Agency: ${r.agency_name || '-'}
Type: ${r.operation_type === 'arrival' ? 'Arrival' : 'Departure'}
Date: ${r.service_date}
Guest: ${r.customer_name}
Hotel: ${r.hotel_name || '-'}
Region: ${r.region_name || '-'}
Pickup: ${r.pickup_location || '-'}
Flight: ${r.flight_code || '-'}
PAX: ${r.pax_adult || '-'}
Vehicle: ${r.vehicle_type || '-'}
Driver: ${r.driver_name || '-'}
Plate: ${r.vehicle_plate || '-'}
Status: ${r.operation_status || '-'}

Thank you for choosing ${companySettings.company_name || 'YU Travel'}.
`

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  function printVoucher(r: any) {
    const html = `
    <html>
    <head>
      <title>${r.reservation_code}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 28px; color: #111827; }
        .voucher { border: 2px solid #111827; }
        .header { display: grid; grid-template-columns: 150px 1fr 220px; border-bottom: 2px solid #111827; align-items: center; }
        .logoBox { padding: 16px; border-right: 2px solid #111827; text-align: center; }
        .logoBox img { width: 110px; height: 110px; object-fit: contain; }
        .titleBox { text-align: center; padding: 18px; }
        .titleBox h1 { margin: 0; font-size: 28px; }
        .titleBox h2 { margin: 8px 0 0; font-size: 18px; color: #0EA5E9; }
        .metaBox { border-left: 2px solid #111827; font-size: 13px; }
        .metaRow { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #111827; }
        .metaRow div { padding: 8px; }
        .sectionTitle { background: #EAF7FC; font-weight: bold; padding: 8px 12px; border-top: 2px solid #111827; border-bottom: 1px solid #111827; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        td, th { border: 1px solid #111827; padding: 8px; vertical-align: top; }
        th { background: #F3F4F6; text-align: left; }
        .box { border-top: 2px solid #111827; padding: 12px; min-height: 70px; }
        .footer { display: grid; grid-template-columns: 1fr 1fr; border-top: 2px solid #111827; }
        .footer div { padding: 12px; min-height: 70px; }
        .footer div:first-child { border-right: 2px solid #111827; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="voucher">
        <div class="header">
          <div class="logoBox"><img src="/logo.png" /></div>
          <div class="titleBox">
            <h1>VOUCHER FORM</h1>
            <h2>${companySettings.company_name || 'YU TRAVEL'}</h2>
            <p>Incoming Tourism Services</p>
          </div>
          <div class="metaBox">
            <div class="metaRow"><div><b>Voucher No</b></div><div>${r.reservation_code || '-'}</div></div>
            <div class="metaRow"><div><b>Agency</b></div><div>${r.agency_name || '-'}</div></div>
            <div class="metaRow"><div><b>Date</b></div><div>${new Date().toLocaleDateString('tr-TR')}</div></div>
            <div class="metaRow"><div><b>Time</b></div><div>${new Date().toLocaleTimeString('tr-TR')}</div></div>
          </div>
        </div>

        <div class="sectionTitle">Customer / Pax Information</div>
        <table>
          <tr><th>Customer Name</th><th>PAX</th><th>Phone</th></tr>
          <tr><td>${r.customer_name || '-'}</td><td>${r.pax_adult || 0}</td><td>${r.customer_phone || '-'}</td></tr>
        </table>

        <div class="sectionTitle">Service Details</div>
        <table>
          <tr><th>Operation</th><th>Date</th><th>Hotel</th><th>Region</th></tr>
          <tr>
            <td>${r.operation_type === 'arrival' ? 'Arrival / Geliş' : 'Departure / Dönüş'}</td>
            <td>${r.service_date || '-'}</td>
            <td>${r.hotel_name || '-'}</td>
            <td>${r.region_name || '-'}</td>
          </tr>
        </table>

        <div class="sectionTitle">Flight / Pickup</div>
        <table>
          <tr><th>Flight</th><th>Pickup Location</th><th>Vehicle</th></tr>
          <tr><td>${r.flight_code || '-'}</td><td>${r.pickup_location || '-'}</td><td>${r.vehicle_type || '-'}</td></tr>
        </table>

        <div class="sectionTitle">Operation Assignment</div>
        <table>
          <tr><th>Driver</th><th>Plate</th><th>Status</th><th>Note</th></tr>
          <tr><td>${r.driver_name || '-'}</td><td>${r.vehicle_plate || '-'}</td><td>${r.meeting_status || '-'}</td><td>${r.operation_note || '-'}</td></tr>
        </table>

        <div class="sectionTitle">Notes</div>
        <div class="box">${r.notes || '-'}</div>

        <div class="footer">
          <div><b>Confirmation Date</b><br/>${new Date().toLocaleDateString('tr-TR')}</div>
          <div>
            <b>${companySettings.company_name || 'YU Travel'} Contact</b><br/>
            ${companySettings.address || 'Antalya / Türkiye'}<br/>
            WhatsApp: ${companySettings.whatsapp || '-'}<br/>
            Email: ${companySettings.email || '-'}
          </div>
        </div>
      </div>
    </body>
    </html>
    `

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.print()
  }

  function setDaily() {
    const d = new Date().toISOString().slice(0, 10)
    setReportFrom(d)
    setReportTo(d)
  }

  function setWeekly() {
    const now = new Date()
    const first = new Date(now)
    first.setDate(now.getDate() - now.getDay() + 1)
    const last = new Date(first)
    last.setDate(first.getDate() + 6)
    setReportFrom(first.toISOString().slice(0, 10))
    setReportTo(last.toISOString().slice(0, 10))
  }

  function setMonthly() {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setReportFrom(first.toISOString().slice(0, 10))
    setReportTo(last.toISOString().slice(0, 10))
  }

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const search = reservationSearch.toLowerCase()

      const searchOk =
        !search ||
        String(r.reservation_code || '').toLowerCase().includes(search) ||
        String(r.customer_name || '').toLowerCase().includes(search) ||
        String(r.customer_phone || '').toLowerCase().includes(search) ||
        String(r.hotel_name || '').toLowerCase().includes(search) ||
        String(r.agency_name || '').toLowerCase().includes(search) ||
        String(r.region_name || '').toLowerCase().includes(search)

      const agencyOk = filterAgency === 'all' || r.agency_name === filterAgency
      const hotelOk = filterHotel === 'all' || r.hotel_name === filterHotel
      const regionOk = filterRegion === 'all' || r.region_name === filterRegion
      const paymentOk = filterPayment === 'all' || r.payment_status === filterPayment
      const operationStatusOk = filterOperationStatus === 'all' || r.operation_status === filterOperationStatus
      const operationTypeOk = filterOperationType === 'all' || r.operation_type === filterOperationType

      return searchOk && agencyOk && hotelOk && regionOk && paymentOk && operationStatusOk && operationTypeOk
    })
  }, [reservations, reservationSearch, filterAgency, filterHotel, filterRegion, filterPayment, filterOperationStatus, filterOperationType])

  function clearReservationFilters() {
    setReservationSearch('')
    setFilterAgency('all')
    setFilterHotel('all')
    setFilterRegion('all')
    setFilterPayment('all')
    setFilterOperationStatus('all')
    setFilterOperationType('all')
  }

  const filteredReports = reservations.filter((r) => {
    const dateOk = r.service_date >= reportFrom && r.service_date <= reportTo
    const typeOk = reportType === 'all' || r.operation_type === reportType
    return dateOk && typeOk
  })

  const operationRows = reservations.filter((r) => {
    const dateOk = r.service_date === operationDate
    const typeOk = operationTypeFilter === 'all' || r.operation_type === operationTypeFilter
    return dateOk && typeOk
  })

  function exportRowsToCsv(rows: any[], fileName: string) {
    const headers = [
      'Voucher No', 'Acente', 'Tip', 'Tarih', 'Müşteri', 'Telefon', 'Otel', 'Bölge',
      'Uçuş', 'Alış Noktası', 'PAX', 'Araç Tipi', 'Şoför', 'Plaka',
      'Karşılama Durumu', 'Operasyon Notu', 'Ödeme', 'Operasyon', 'Satış USD', 'Maliyet USD', 'Kâr USD',
    ]

    const csvRows = rows.map((r: any) => [
      r.reservation_code || '',
      r.agency_name || '',
      r.operation_type === 'arrival' ? 'Geliş' : 'Dönüş',
      r.service_date || '',
      r.customer_name || '',
      r.customer_phone || '',
      r.hotel_name || '',
      r.region_name || '',
      r.flight_code || '',
      r.pickup_location || '',
      r.pax_adult || '',
      r.vehicle_type || '',
      r.driver_name || '',
      r.vehicle_plate || '',
      r.meeting_status || '',
      r.operation_note || '',
      r.payment_status || '',
      r.operation_status || '',
      r.sale_amount || 0,
      r.cost_amount || 0,
      Number(r.sale_amount || 0) - Number(r.cost_amount || 0),
    ])

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportReportToExcel() {
    exportRowsToCsv(filteredReports, `YU-Travel-Operasyon-Raporu-${reportFrom}-${reportTo}.csv`)
  }

  function exportDailyOperationExcel() {
    exportRowsToCsv(operationRows, `YU-Travel-Gunluk-Operasyon-${operationDate}.csv`)
  }

  function exportReservationsBackup() {
    exportRowsToCsv(reservations, `YU-Travel-Rezervasyon-Yedek-${today}.csv`)
  }

  function exportFilteredReservationsExcel() {
    exportRowsToCsv(filteredReservations, `YU-Travel-Filtreli-Rezervasyon-${today}.csv`)
  }

  function exportOperationsBackup() {
    exportRowsToCsv(reservations, `YU-Travel-Operasyon-Yedek-${today}.csv`)
  }

  function exportFinanceReportExcel() {
    const headers = ['Tarih', 'Tip', 'Kategori', 'Ödeme Yöntemi', 'İlgili', 'Tutar USD', 'Açıklama']

    const rows = finance.map((f: any) => [
      f.transaction_date || '',
      f.type === 'income' ? 'Gelir' : 'Gider',
      f.category || '',
      f.payment_method || '',
      f.related_party || '',
      f.type === 'income' ? Number(f.amount || 0) : -Number(f.amount || 0),
      f.description || '',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `YU-Travel-Muhasebe-Raporu-${today}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportAllDefinitionsBackup() {
    const headers = ['Tip', 'Ad / Değer']

    const rows = [
      ...agencies.map((x: any) => ['Acente', x.name]),
      ...regions.map((x: any) => ['Bölge', x.name]),
      ...hotels.map((x: any) => ['Otel', x.name]),
      ...vehicleTypes.map((x: any) => ['Araç Tipi', x.name]),
      ...drivers.map((x: any) => ['Şoför', x.name]),
      ...fleet.map((x: any) => ['Plaka', x.plate]),
    ]

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `YU-Travel-Tanimlar-Yedek-${today}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function printOperationHtml(rowsData: any[], type: string, from: string, to: string, titleText: string) {
    const reportTitle = type === 'all' ? titleText : type === 'arrival' ? `${titleText} - Geliş` : `${titleText} - Dönüş`

    const rows = rowsData.map((r: any) => `
      <tr>
        <td>${r.reservation_code || '-'}</td>
        <td>${r.agency_name || '-'}</td>
        <td>${r.operation_type === 'arrival' ? 'Geliş' : 'Dönüş'}</td>
        <td>${r.service_date || '-'}</td>
        <td>${r.customer_name || '-'}</td>
        <td>${r.customer_phone || '-'}</td>
        <td>${r.hotel_name || '-'}</td>
        <td>${r.region_name || '-'}</td>
        <td>${r.flight_code || '-'}</td>
        <td>${r.pickup_location || '-'}</td>
        <td>${r.pax_adult || '-'}</td>
        <td>${r.driver_name || '-'}</td>
        <td>${r.vehicle_plate || '-'}</td>
        <td>${r.meeting_status || '-'}</td>
        <td>${r.operation_note || '-'}</td>
      </tr>
    `).join('')

    const html = `
    <html>
    <head>
      <title>${reportTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 28px; color: #111827; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 20px; }
        .brand { display: flex; align-items: center; gap: 14px; }
        .brand img { width: 80px; height: 80px; object-fit: contain; }
        h1 { margin: 0; font-size: 26px; }
        .meta { text-align: right; font-size: 13px; color: #374151; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { border: 1px solid #111827; padding: 5px; text-align: left; }
        th { background: #EAF7FC; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <img src="/logo.png" />
          <div>
            <h1>${reportTitle}</h1>
            <div>${companySettings.company_name || 'YU Travel'} Incoming Operations</div>
          </div>
        </div>
        <div class="meta">
          <div><b>Tarih:</b> ${from} / ${to}</div>
          <div><b>Tip:</b> ${type === 'all' ? 'Tümü' : type === 'arrival' ? 'Geliş' : 'Dönüş'}</div>
          <div><b>Toplam Kayıt:</b> ${rowsData.length}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Voucher</th><th>Acente</th><th>Tip</th><th>Tarih</th><th>Müşteri</th><th>Telefon</th>
            <th>Otel</th><th>Bölge</th><th>Uçuş</th><th>Alış</th><th>PAX</th><th>Şoför</th>
            <th>Plaka</th><th>Durum</th><th>Not</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="15">Kayıt yok</td></tr>'}</tbody>
      </table>
    </body>
    </html>
    `

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.print()
  }

  function printOperationReport() {
    printOperationHtml(filteredReports, reportType, reportFrom, reportTo, 'Operasyon Raporu')
  }

  function printDailyOperation() {
    printOperationHtml(operationRows, operationTypeFilter, operationDate, operationDate, 'Günlük Operasyon Planı')
  }

  function printFinanceReport() {
    const rows = finance.map((f: any) => `
      <tr>
        <td>${f.transaction_date || '-'}</td>
        <td>${f.type === 'income' ? 'Gelir' : 'Gider'}</td>
        <td>${f.category || '-'}</td>
        <td>${f.payment_method || '-'}</td>
        <td>${f.related_party || '-'}</td>
        <td>${f.type === 'income' ? '+' : '-'}$${f.amount || 0}</td>
        <td>${f.description || '-'}</td>
      </tr>
    `).join('')

    const html = `
    <html>
    <head>
      <title>Muhasebe Raporu</title>
      <style>
        body { font-family: Arial; padding: 28px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #111827; padding: 8px; text-align: left; }
        th { background: #EAF7FC; }
      </style>
    </head>
    <body>
      <h1>${companySettings.company_name || 'YU Travel'} Muhasebe Raporu</h1>
      <p>Gelir: $${financeIncome} | Gider: $${financeExpense} | Net: $${financeNet}</p>
      <table>
        <thead>
          <tr><th>Tarih</th><th>Tip</th><th>Kategori</th><th>Yöntem</th><th>İlgili</th><th>Tutar</th><th>Açıklama</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">Kayıt yok</td></tr>'}</tbody>
      </table>
    </body>
    </html>
    `

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.print()
  }

  const totalSale = reservations.reduce((a, b) => a + Number(b.sale_amount || 0), 0)
  const totalCost = reservations.reduce((a, b) => a + Number(b.cost_amount || 0), 0)
  const totalProfit = totalSale - totalCost

  const paid = reservations.filter((r) => r.payment_status === 'paid').length
  const unpaid = reservations.filter((r) => r.payment_status === 'unpaid').length
  const completed = reservations.filter((r) => r.operation_status === 'completed').length
  const cancelled = reservations.filter((r) => r.operation_status === 'cancelled').length

  const financeIncome = finance.filter((x) => x.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0)
  const financeExpense = finance.filter((x) => x.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0)
  const financeNet = financeIncome - financeExpense

  const cashTotal = finance
    .filter((x) => x.payment_method === 'cash')
    .reduce((a, b) => a + (b.type === 'income' ? Number(b.amount || 0) : -Number(b.amount || 0)), 0)

  const agencyBalance = finance
    .filter((x) => x.payment_method === 'agency' || x.category === 'agency')
    .reduce((a, b) => a + (b.type === 'income' ? Number(b.amount || 0) : -Number(b.amount || 0)), 0)

  const agencyReceivables = agencies
    .map((agency: any) => {
      const agencyReservations = reservations.filter((r) => r.agency_name === agency.name && r.payment_status !== 'paid')
      const totalAgencySale = agencyReservations.reduce((sum, r) => sum + Number(r.sale_amount || 0), 0)
      return { name: agency.name, count: agencyReservations.length, total: totalAgencySale }
    })
    .filter((x) => x.total > 0)

  if (loginLoading) {
    return (
      <div style={loginPage}>
        <div style={loginCard}>
          <img src="/logo.png" style={loginLogo} alt="YU Travel Logo" />
          <h2 style={{ color: '#111827' }}>Yükleniyor...</h2>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={loginPage}>
        <div style={loginCard}>
          <img src="/logo.png" style={loginLogo} alt="YU Travel Logo" />

          <h1 style={loginTitle}>YU Travel ERP</h1>
          <p style={loginSub}>Premium Incoming Automation System</p>

          <input style={loginInput} type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
          <input style={loginInput} type="password" placeholder="Şifre" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

          <button style={loginButton} onClick={login}>Giriş Yap</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          body { overflow-x: hidden; }
          .yu-page { flex-direction: column !important; }
          .yu-sidebar { width: 100% !important; box-sizing: border-box; }
          .yu-main { padding: 18px !important; box-sizing: border-box; }
          .yu-title { font-size: 32px !important; }
          .yu-cards { grid-template-columns: 1fr !important; }
          .yu-grid { grid-template-columns: 1fr !important; }
          .yu-detail-grid { grid-template-columns: 1fr !important; }
          table { min-width: 920px; }
          .yu-modal-box { width: 96vw !important; padding: 18px !important; }
          .yu-logo-image { width: 120px !important; height: 120px !important; }
        }
      `}</style>

      <div style={page} className="yu-page">
        <aside style={sidebar} className="yu-sidebar">
          <div style={brandBox}>
            <img src="/logo.png" style={logoImage} className="yu-logo-image" alt="YU Travel Logo" />

            <div style={{ textAlign: 'center' }}>
              <h1 style={logo}>YU ERP</h1>
              <p style={sideText}>Premium Incoming System</p>
            </div>
          </div>

          {['Dashboard', 'Rezervasyonlar', 'Operasyon', 'Muhasebe', 'Raporlar', 'Tanımlar', 'Ayarlar'].map((m) => (
            <button key={m} onClick={() => setActive(m)} style={{ ...menu, background: active === m ? '#0EA5E9' : '#1F2937' }}>
              {m}
            </button>
          ))}

          <button style={logoutButton} onClick={logout}>Çıkış Yap</button>
        </aside>

        <main style={main} className="yu-main">
          <h1 style={title} className="yu-title">{active}</h1>

          {selectedReservation && (
            <div style={modalOverlay}>
              <div style={modalBox} className="yu-modal-box">
                <div style={modalHeader}>
                  <div>
                    <h2 style={{ margin: 0 }}>Rezervasyon Detayı</h2>
                    <p style={{ margin: '6px 0 0', color: '#6B7280' }}>
                      Voucher No: {selectedReservation.reservation_code || '-'}
                    </p>
                  </div>

                  <button style={smallRed} onClick={() => setSelectedReservation(null)}>Kapat</button>
                </div>

                <div style={detailGrid} className="yu-detail-grid">
                  <DetailItem label="Müşteri" value={selectedReservation.customer_name} />
                  <DetailItem label="Telefon" value={selectedReservation.customer_phone} />
                  <DetailItem label="Acente" value={selectedReservation.agency_name} />
                  <DetailItem label="Otel" value={selectedReservation.hotel_name} />
                  <DetailItem label="Bölge" value={selectedReservation.region_name} />
                  <DetailItem label="Operasyon Tipi" value={selectedReservation.operation_type === 'arrival' ? 'Geliş' : 'Dönüş'} />
                  <DetailItem label="Tarih" value={selectedReservation.service_date} />
                  <DetailItem label="Uçuş" value={selectedReservation.flight_code} />
                  <DetailItem label="Alış Noktası" value={selectedReservation.pickup_location} />
                  <DetailItem label="PAX" value={selectedReservation.pax_adult} />
                  <DetailItem label="Araç Tipi" value={selectedReservation.vehicle_type} />
                  <DetailItem label="Satış" value={`$${selectedReservation.sale_amount || 0}`} />
                  <DetailItem label="Maliyet" value={`$${selectedReservation.cost_amount || 0}`} />
                  <DetailItem label="Kâr" value={`$${Number(selectedReservation.sale_amount || 0) - Number(selectedReservation.cost_amount || 0)}`} />
                  <DetailItem label="Ödeme Durumu" value={selectedReservation.payment_status} />
                  <DetailItem label="Operasyon Durumu" value={selectedReservation.operation_status} />
                  <DetailItem label="Şoför" value={selectedReservation.driver_name} />
                  <DetailItem label="Plaka" value={selectedReservation.vehicle_plate} />
                  <DetailItem label="Karşılama Durumu" value={selectedReservation.meeting_status} />
                  <DetailItem label="Operasyon Notu" value={selectedReservation.operation_note} />
                  <DetailItem label="Rezervasyon Notu" value={selectedReservation.notes} />
                </div>

                <div style={{ marginTop: 22 }}>
                  <button style={smallBlue} onClick={() => printVoucher(selectedReservation)}>Voucher PDF</button>
                  <button style={smallGreen} onClick={() => sendWhatsApp(selectedReservation)}>WhatsApp</button>
                  <button style={smallGray} onClick={() => { editReservation(selectedReservation); setSelectedReservation(null) }}>Düzenle</button>
                  <button style={smallRed} onClick={() => { deleteReservation(selectedReservation.id); setSelectedReservation(null) }}>Sil</button>
                </div>
              </div>
            </div>
          )}

          {active === 'Dashboard' && (
            <>
              <div style={cards} className="yu-cards">
                <Card title="Toplam Rezervasyon" value={reservations.length} />
                <Card title="Toplam Satış" value={'$' + totalSale} />
                <Card title="Net Kâr" value={'$' + totalProfit} />
                <Card title="Aktif Operasyon" value={reservations.length - completed - cancelled} />
                <Card title="Ödenen" value={paid} />
                <Card title="Ödenmeyen" value={unpaid} />
                <Card title="Tamamlanan" value={completed} />
                <Card title="İptal" value={cancelled} />
              </div>

              <div style={box}>
                <h2>Hızlı İşlemler</h2>
                <div style={toolbar}>
                  <button style={button} onClick={() => setActive('Rezervasyonlar')}>Yeni Rezervasyon</button>
                  <button style={button} onClick={() => setActive('Operasyon')}>Bugünkü Operasyon</button>
                  <button style={button} onClick={() => setActive('Muhasebe')}>Muhasebe</button>
                  <button style={grayButton} onClick={() => setActive('Raporlar')}>Raporlar</button>
                </div>
              </div>
            </>
          )}

          {active === 'Rezervasyonlar' && (
            <>
              <div style={box}>
                <h2>{editingId ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon Ekle'}</h2>

                <h3 style={sectionTitle}>1. Müşteri Bilgileri</h3>
                <div style={grid} className="yu-grid">
                  <Input v={form.customer_name} set={(x: string) => update('customer_name', x)} p="Müşteri adı" />
                  <Input v={form.customer_phone} set={(x: string) => update('customer_phone', x)} p="Telefon / WhatsApp" />
                  <Select v={form.agency_name} set={(x: string) => update('agency_name', x)} p="Acente Seç" list={agencies} />
                </div>

                <h3 style={sectionTitle}>2. Operasyon Bilgileri</h3>
                <div style={grid} className="yu-grid">
                  <select style={input} value={form.operation_type} onChange={(e) => update('operation_type', e.target.value)}>
                    <option value="arrival">Sadece Geliş</option>
                    <option value="departure">Sadece Dönüş</option>
                    <option value="roundtrip">Geliş + Dönüş</option>
                  </select>

                  <input style={input} type="date" value={form.service_date} onChange={(e) => update('service_date', e.target.value)} />

                  <Select v={form.region_name} set={(x: string) => update('region_name', x)} p="Bölge Seç" list={regions} />
                  <Select v={form.hotel_name} set={(x: string) => update('hotel_name', x)} p="Otel Seç" list={hotels} />
                  <Select v={form.vehicle_type} set={(x: string) => update('vehicle_type', x)} p="Araç Tipi Seç" list={vehicleTypes} />

                  <Input
                    v={form.flight_code}
                    set={(x: string) => update('flight_code', x)}
                    p={form.operation_type === 'departure' ? 'Dönüş uçuş kodu' : 'Geliş uçuş kodu'}
                  />

                  <Input
                    v={form.pickup_location}
                    set={(x: string) => update('pickup_location', x)}
                    p={form.operation_type === 'departure' ? 'Dönüş alış noktası' : 'Geliş alış noktası'}
                  />

                  {form.operation_type === 'roundtrip' && (
                    <>
                      <input
                        style={input}
                        type="date"
                        value={form.return_date}
                        onChange={(e) => update('return_date', e.target.value)}
                      />

                      <Input
                        v={form.return_flight_code}
                        set={(x: string) => update('return_flight_code', x)}
                        p="Dönüş uçuş kodu"
                      />

                      <Input
                        v={form.return_pickup_location}
                        set={(x: string) => update('return_pickup_location', x)}
                        p="Dönüş alış noktası / Otelden çıkış"
                      />
                    </>
                  )}

                  <Input v={form.pax_adult} set={(x: string) => update('pax_adult', x)} p="PAX" />
                </div>

                <h3 style={sectionTitle}>3. Ücret Bilgileri</h3>
                <div style={grid} className="yu-grid">
                  <Input v={form.sale_amount} set={(x: string) => update('sale_amount', x)} p="Toplam satış USD" />
                  <Input v={form.cost_amount} set={(x: string) => update('cost_amount', x)} p="Toplam maliyet USD" />

                  <div style={profitCard}>
                    <span style={{ color: '#6B7280', fontSize: 14 }}>Otomatik Toplam Kâr</span>
                    <strong style={{ fontSize: 24, color: '#111827' }}>
                      ${Number(form.sale_amount || 0) - Number(form.cost_amount || 0)}
                    </strong>
                    {form.operation_type === 'roundtrip' && (
                      <span style={{ color: '#6B7280', fontSize: 13 }}>
                        Geliş ve dönüşe otomatik yarı yarıya bölünür.
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={sectionTitle}>4. Durum Bilgileri</h3>
                <div style={grid} className="yu-grid">
                  <select style={input} value={form.payment_status} onChange={(e) => update('payment_status', e.target.value)}>
                    <option value="unpaid">Ödenmedi</option>
                    <option value="paid">Ödendi</option>
                    <option value="deposit">Kapora</option>
                  </select>

                  <select style={input} value={form.operation_status} onChange={(e) => update('operation_status', e.target.value)}>
                    <option value="option">Opsiyon</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal</option>
                  </select>
                </div>

                <textarea
                  style={{ ...input, minHeight: 90 }}
                  placeholder="Rezervasyon notu"
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                />

                <div style={{ marginTop: 20 }}>
                  <button style={button} onClick={saveReservation}>
                    {editingId ? 'Rezervasyonu Güncelle' : 'Rezervasyonu Kaydet'}
                  </button>

                  {editingId && <button style={grayButton} onClick={clearForm}>İptal</button>}
                </div>
              </div>

              <div style={box}>
                <h2>Arama / Filtre</h2>

                <div style={grid} className="yu-grid">
                  <input
                    style={input}
                    placeholder="Voucher, müşteri, telefon, otel, acente, bölge ara"
                    value={reservationSearch}
                    onChange={(e) => setReservationSearch(e.target.value)}
                  />

                  <select style={input} value={filterAgency} onChange={(e) => setFilterAgency(e.target.value)}>
                    <option value="all">Tüm Acenteler</option>
                    {agencies.map((x: any) => <option key={x.id} value={x.name}>{x.name}</option>)}
                  </select>

                  <select style={input} value={filterHotel} onChange={(e) => setFilterHotel(e.target.value)}>
                    <option value="all">Tüm Oteller</option>
                    {hotels.map((x: any) => <option key={x.id} value={x.name}>{x.name}</option>)}
                  </select>

                  <select style={input} value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
                    <option value="all">Tüm Bölgeler</option>
                    {regions.map((x: any) => <option key={x.id} value={x.name}>{x.name}</option>)}
                  </select>

                  <select style={input} value={filterOperationType} onChange={(e) => setFilterOperationType(e.target.value)}>
                    <option value="all">Geliş + Dönüş</option>
                    <option value="arrival">Sadece Geliş</option>
                    <option value="departure">Sadece Dönüş</option>
                  </select>

                  <select style={input} value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
                    <option value="all">Tüm Ödeme Durumları</option>
                    <option value="unpaid">Ödenmedi</option>
                    <option value="paid">Ödendi</option>
                    <option value="deposit">Kapora</option>
                  </select>

                  <select style={input} value={filterOperationStatus} onChange={(e) => setFilterOperationStatus(e.target.value)}>
                    <option value="all">Tüm Operasyon Durumları</option>
                    <option value="option">Opsiyon</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal</option>
                  </select>
                </div>

                <button style={grayButton} onClick={clearReservationFilters}>Filtreleri Temizle</button>
                <button style={button} onClick={exportFilteredReservationsExcel}>Filtreli Liste Excel</button>

                <p style={{ color: '#6B7280', marginTop: 12 }}>
                  Gösterilen kayıt: {filteredReservations.length} / {reservations.length}
                </p>
              </div>

              <ReservationTable
                rows={filteredReservations}
                edit={editReservation}
                del={deleteReservation}
                pdf={printVoucher}
                wa={sendWhatsApp}
                detail={setSelectedReservation}
              />
            </>
          )}

          {active === 'Operasyon' && (
            <>
              <div style={box}>
                <h2>Günlük Operasyon Planlama</h2>

                <div style={toolbar}>
                  <input style={inputSmall} type="date" value={operationDate} onChange={(e) => setOperationDate(e.target.value)} />

                  <select style={inputSmall} value={operationTypeFilter} onChange={(e) => setOperationTypeFilter(e.target.value)}>
                    <option value="all">Tümü</option>
                    <option value="arrival">Geliş</option>
                    <option value="departure">Dönüş</option>
                  </select>

                  <button style={grayButton} onClick={printDailyOperation}>Günlük Operasyon PDF</button>
                  <button style={button} onClick={exportDailyOperationExcel}>Günlük Operasyon Excel</button>
                </div>
              </div>

              <OperationTable rows={operationRows} drivers={drivers} fleet={fleet} updateOperationField={updateOperationField} pdf={printVoucher} wa={sendWhatsApp} />
            </>
          )}

          {active === 'Muhasebe' && (
            <>
              <div style={cards} className="yu-cards">
                <Card title="Rezervasyon Satışı" value={'$' + totalSale} />
                <Card title="Rezervasyon Maliyeti" value={'$' + totalCost} />
                <Card title="Rezervasyon Kârı" value={'$' + totalProfit} />
                <Card title="Net Kasa" value={'$' + financeNet} />
                <Card title="Gelir" value={'$' + financeIncome} />
                <Card title="Gider" value={'$' + financeExpense} />
                <Card title="Nakit Kasa" value={'$' + cashTotal} />
                <Card title="Acente Cari" value={'$' + agencyBalance} />
              </div>

              <div style={box}>
                <h2>Gelir / Gider Kaydı</h2>

                <div style={grid} className="yu-grid">
                  <select style={input} value={financeForm.type} onChange={(e) => updateFinance('type', e.target.value)}>
                    <option value="income">Gelir</option>
                    <option value="expense">Gider</option>
                  </select>

                  <select style={input} value={financeForm.category} onChange={(e) => updateFinance('category', e.target.value)}>
                    <option value="cash">Nakit</option>
                    <option value="agency">Acente</option>
                    <option value="hotel">Otel</option>
                    <option value="driver">Şoför</option>
                    <option value="vehicle">Araç</option>
                    <option value="fuel">Yakıt</option>
                    <option value="office">Ofis</option>
                    <option value="other">Diğer</option>
                  </select>

                  <select style={input} value={financeForm.payment_method} onChange={(e) => updateFinance('payment_method', e.target.value)}>
                    <option value="cash">Nakit</option>
                    <option value="bank">Banka</option>
                    <option value="card">Kart</option>
                    <option value="agency">Acente Cari</option>
                    <option value="online">Online</option>
                  </select>

                  <input style={input} placeholder="İlgili kişi / acente / tedarikçi" value={financeForm.related_party} onChange={(e) => updateFinance('related_party', e.target.value)} />
                  <input style={input} type="number" placeholder="Tutar USD" value={financeForm.amount} onChange={(e) => updateFinance('amount', e.target.value)} />
                  <input style={input} type="date" value={financeForm.transaction_date} onChange={(e) => updateFinance('transaction_date', e.target.value)} />
                </div>

                <textarea style={{ ...input, minHeight: 90 }} placeholder="Açıklama" value={financeForm.description} onChange={(e) => updateFinance('description', e.target.value)} />

                <button style={button} onClick={saveFinance}>Muhasebe Kaydı Ekle</button>
                <button style={grayButton} onClick={printFinanceReport}>Muhasebe PDF</button>
                <button style={button} onClick={exportFinanceReportExcel}>Muhasebe Excel</button>
              </div>

              <FinanceTable finance={finance} deleteFinance={deleteFinance} />

              <div style={box}>
                <h2>Acente Cari / Alacak Raporu</h2>

                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Acente</th>
                      <th style={th}>Ödenmemiş Rezervasyon</th>
                      <th style={th}>Toplam Alacak</th>
                    </tr>
                  </thead>

                  <tbody>
                    {agencyReceivables.map((a: any) => (
                      <tr key={a.name}>
                        <td style={td}>{a.name}</td>
                        <td style={td}>{a.count}</td>
                        <td style={{ ...td, color: '#DC2626', fontWeight: 700 }}>${a.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {active === 'Raporlar' && (
            <div style={box}>
              <h2>Geliş / Dönüş Listeleri</h2>

              <div style={toolbar}>
                <button style={button} onClick={setDaily}>Günlük</button>
                <button style={button} onClick={setWeekly}>Haftalık</button>
                <button style={button} onClick={setMonthly}>Aylık</button>

                <input style={inputSmall} type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
                <input style={inputSmall} type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />

                <select style={inputSmall} value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="all">Tümü</option>
                  <option value="arrival">Geliş</option>
                  <option value="departure">Dönüş</option>
                </select>

                <button style={grayButton} onClick={printOperationReport}>Operasyon PDF</button>
                <button style={button} onClick={exportReportToExcel}>Operasyon Excel</button>
              </div>

              <ReservationTable
                rows={filteredReports}
                edit={editReservation}
                del={deleteReservation}
                pdf={printVoucher}
                wa={sendWhatsApp}
                detail={setSelectedReservation}
              />
            </div>
          )}

          {active === 'Tanımlar' && (
            <div style={grid} className="yu-grid">
              <Definition table="agencies" title="Acente" value={newAgency} set={setNewAgency} save={() => addOrUpdateDefinition('agencies', newAgency, setNewAgency)} list={agencies} edit={startEditDefinition} del={deleteDefinition} />
              <Definition table="regions" title="Bölge" value={newRegion} set={setNewRegion} save={() => addOrUpdateDefinition('regions', newRegion, setNewRegion)} list={regions} edit={startEditDefinition} del={deleteDefinition} />
              <Definition table="hotels" title="Otel" value={newHotel} set={setNewHotel} save={() => addOrUpdateDefinition('hotels', newHotel, setNewHotel)} list={hotels} edit={startEditDefinition} del={deleteDefinition} />
              <Definition table="vehicle_types" title="Araç Tipi" value={newVehicleType} set={setNewVehicleType} save={() => addOrUpdateDefinition('vehicle_types', newVehicleType, setNewVehicleType)} list={vehicleTypes} edit={startEditDefinition} del={deleteDefinition} />
              <Definition table="drivers" title="Şoför" value={newDriver} set={setNewDriver} save={() => addOrUpdateDefinition('drivers', newDriver, setNewDriver)} list={drivers} edit={startEditDefinition} del={deleteDefinition} />
              <PlateDefinition value={newPlate} set={setNewPlate} save={addOrUpdatePlate} list={fleet} edit={startEditPlate} del={deletePlate} />
            </div>
          )}

          {active === 'Ayarlar' && (
            <>
              <div style={box}>
                <h2>Şirket Ayarları</h2>

                <div style={grid} className="yu-grid">
                  <input style={input} placeholder="Şirket adı" value={companySettings.company_name || ''} onChange={(e) => updateCompanySetting('company_name', e.target.value)} />
                  <input style={input} placeholder="WhatsApp" value={companySettings.whatsapp || ''} onChange={(e) => updateCompanySetting('whatsapp', e.target.value)} />
                  <input style={input} placeholder="Email" value={companySettings.email || ''} onChange={(e) => updateCompanySetting('email', e.target.value)} />
                  <input style={input} placeholder="Adres" value={companySettings.address || ''} onChange={(e) => updateCompanySetting('address', e.target.value)} />
                </div>

                <button style={button} onClick={saveCompanySettings}>Ayarları Kaydet</button>
              </div>

              <div style={box}>
                <h2>Yedekleme / Dışa Aktarma</h2>

                <div style={toolbar}>
                  <button style={button} onClick={exportReservationsBackup}>Rezervasyon Yedeği Excel</button>
                  <button style={button} onClick={exportOperationsBackup}>Operasyon Yedeği Excel</button>
                  <button style={button} onClick={exportFinanceReportExcel}>Muhasebe Yedeği Excel</button>
                  <button style={grayButton} onClick={exportAllDefinitionsBackup}>Tanımlar Yedeği Excel</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}

function Input({ v, set, p }: any) {
  return <input style={input} value={v} onChange={(e) => set(e.target.value)} placeholder={p} />
}

function Select({ v, set, p, list }: any) {
  return (
    <select style={input} value={v} onChange={(e) => set(e.target.value)}>
      <option value="">{p}</option>
      {list.map((x: any) => (
        <option key={x.id} value={x.name}>{x.name}</option>
      ))}
    </select>
  )
}

function Card({ title, value }: any) {
  return (
    <div style={card}>
      <h3 style={{ color: '#374151' }}>{title}</h3>
      <h2 style={{ color: '#111827' }}>{value}</h2>
    </div>
  )
}

function StatusBadge({ type, value }: any) {
  let label = value || '-'
  let bg = '#F3F4F6'
  let color = '#374151'

  if (type === 'payment') {
    if (value === 'paid') {
      label = 'Ödendi'
      bg = '#DCFCE7'
      color = '#166534'
    }

    if (value === 'unpaid') {
      label = 'Ödenmedi'
      bg = '#FEE2E2'
      color = '#991B1B'
    }

    if (value === 'deposit') {
      label = 'Kapora'
      bg = '#FEF3C7'
      color = '#92400E'
    }
  }

  if (type === 'operation') {
    if (value === 'option') {
      label = 'Opsiyon'
      bg = '#F3F4F6'
      color = '#374151'
    }

    if (value === 'confirmed') {
      label = 'Onaylandı'
      bg = '#DBEAFE'
      color = '#1D4ED8'
    }

    if (value === 'completed') {
      label = 'Tamamlandı'
      bg = '#DCFCE7'
      color = '#166534'
    }

    if (value === 'cancelled') {
      label = 'İptal'
      bg = '#FEE2E2'
      color = '#991B1B'
    }
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 999,
        background: bg,
        color,
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function DetailItem({ label, value }: any) {
  return (
    <div style={detailItem}>
      <span style={detailLabel}>{label}</span>
      <strong style={detailValue}>{value || '-'}</strong>
    </div>
  )
}

function Definition({ table, title, value, set, save, list, edit, del }: any) {
  return (
    <div style={box}>
      <h2>{title} Yönetimi</h2>
      <input style={input} value={value} onChange={(e) => set(e.target.value)} placeholder={title + ' adı'} />
      <button style={button} onClick={save}>Kaydet / Güncelle</button>

      <ul style={{ paddingLeft: 0 }}>
        {list.map((x: any) => (
          <li key={x.id} style={defRow}>
            <span>{x.name}</span>
            <span>
              <button style={smallGray} onClick={() => edit(table, x, set)}>Düzenle</button>
              <button style={smallRed} onClick={() => del(table, x.id)}>Sil</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PlateDefinition({ value, set, save, list, edit, del }: any) {
  return (
    <div style={box}>
      <h2>Araç / Plaka Yönetimi</h2>
      <input style={input} value={value} onChange={(e) => set(e.target.value)} placeholder="Plaka / Araç adı" />
      <button style={button} onClick={save}>Kaydet / Güncelle</button>

      <ul style={{ paddingLeft: 0 }}>
        {list.map((x: any) => (
          <li key={x.id} style={defRow}>
            <span>{x.plate}</span>
            <span>
              <button style={smallGray} onClick={() => edit(x)}>Düzenle</button>
              <button style={smallRed} onClick={() => del(x.id)}>Sil</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
function ReservationTable({ rows, edit, del, pdf, wa, detail }: any) {
  function getMainReservationNo(code: string) {
    const match = String(code || '').match(/^(YU\d+)/)
    return match ? match[1] : code || '-'
  }

  return (
    <div style={box}>
      <h2>Liste</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Ana No</th>
            <th style={th}>Voucher</th>
            <th style={th}>Tip</th>
            <th style={th}>Tarih</th>
            <th style={th}>Müşteri</th>
            <th style={th}>Acente</th>
            <th style={th}>Otel</th>
            <th style={th}>PAX</th>
            <th style={th}>Ödeme</th>
            <th style={th}>Durum</th>
            <th style={th}>Satış</th>
            <th style={th}>Kâr</th>
            <th style={th}>İşlem</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id}>
              <td style={td}>{getMainReservationNo(r.reservation_code)}</td>
              <td style={td}>{r.reservation_code}</td>
              <td style={td}>{r.operation_type === 'arrival' ? 'Geliş' : 'Dönüş'}</td>
              <td style={td}>{r.service_date}</td>
              <td style={td}>{r.customer_name}</td>
              <td style={td}>{r.agency_name || '-'}</td>
              <td style={td}>{r.hotel_name}</td>
              <td style={td}>{r.pax_adult}</td>

              <td style={td}>
                <StatusBadge type="payment" value={r.payment_status} />
              </td>

              <td style={td}>
                <StatusBadge type="operation" value={r.operation_status} />
              </td>

              <td style={td}>${r.sale_amount}</td>
              <td style={td}>${Number(r.sale_amount || 0) - Number(r.cost_amount || 0)}</td>

              <td style={td}>
                <button style={smallBlue} onClick={() => detail(r)}>Detay</button>
                <button style={smallGray} onClick={() => edit(r)}>Düzenle</button>
                <button style={smallBlue} onClick={() => pdf(r)}>PDF</button>
                <button style={smallGreen} onClick={() => wa(r)}>WhatsApp</button>
                <button style={smallRed} onClick={() => del(r.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function OperationTable({ rows, drivers, fleet, updateOperationField, pdf, wa }: any) {
  return (
    <div style={box}>
      <h2>Operasyon Listesi</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Voucher</th>
            <th style={th}>Tip</th>
            <th style={th}>Tarih</th>
            <th style={th}>Müşteri</th>
            <th style={th}>Acente</th>
            <th style={th}>Otel</th>
            <th style={th}>PAX</th>
            <th style={th}>Şoför</th>
            <th style={th}>Plaka</th>
            <th style={th}>Karşılama</th>
            <th style={th}>Not</th>
            <th style={th}>İşlem</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id}>
              <td style={td}>{r.reservation_code}</td>
              <td style={td}>{r.operation_type === 'arrival' ? 'Geliş' : 'Dönüş'}</td>
              <td style={td}>{r.service_date}</td>
              <td style={td}>{r.customer_name}</td>
              <td style={td}>{r.agency_name || '-'}</td>
              <td style={td}>{r.hotel_name}</td>
              <td style={td}>{r.pax_adult}</td>

              <td style={td}>
                <select style={miniInput} value={r.driver_name || ''} onChange={(e) => updateOperationField(r.id, 'driver_name', e.target.value)}>
                  <option value="">Şoför seç</option>
                  {drivers.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </td>

              <td style={td}>
                <select style={miniInput} value={r.vehicle_plate || ''} onChange={(e) => updateOperationField(r.id, 'vehicle_plate', e.target.value)}>
                  <option value="">Plaka seç</option>
                  {fleet.map((v: any) => <option key={v.id} value={v.plate}>{v.plate}</option>)}
                </select>
              </td>

              <td style={td}>
                <select style={miniInput} value={r.meeting_status || 'waiting'} onChange={(e) => updateOperationField(r.id, 'meeting_status', e.target.value)}>
                  <option value="waiting">Bekliyor</option>
                  <option value="met">Karşılandı</option>
                  <option value="on_way">Yolda</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="problem">Problem</option>
                </select>
              </td>

              <td style={td}>
                <input style={miniInput} defaultValue={r.operation_note || ''} onBlur={(e) => updateOperationField(r.id, 'operation_note', e.target.value)} />
              </td>

              <td style={td}>
                <button style={smallBlue} onClick={() => pdf(r)}>Voucher</button>
                <button style={smallGreen} onClick={() => wa(r)}>WhatsApp</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinanceTable({ finance, deleteFinance }: any) {
  return (
    <div style={box}>
      <h2>Muhasebe Hareketleri</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Tarih</th>
            <th style={th}>Tip</th>
            <th style={th}>Kategori</th>
            <th style={th}>Yöntem</th>
            <th style={th}>İlgili</th>
            <th style={th}>Tutar</th>
            <th style={th}>Açıklama</th>
            <th style={th}>İşlem</th>
          </tr>
        </thead>

        <tbody>
          {finance.map((f: any) => (
            <tr key={f.id}>
              <td style={td}>{f.transaction_date}</td>
              <td style={td}>{f.type === 'income' ? 'Gelir' : 'Gider'}</td>
              <td style={td}>{f.category}</td>
              <td style={td}>{f.payment_method}</td>
              <td style={td}>{f.related_party || '-'}</td>
              <td style={{ ...td, color: f.type === 'income' ? '#16A34A' : '#DC2626', fontWeight: 700 }}>
                {f.type === 'income' ? '+' : '-'}${f.amount}
              </td>
              <td style={td}>{f.description || '-'}</td>
              <td style={td}>
                <button style={smallRed} onClick={() => deleteFinance(f.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const loginPage = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,#081126,#0EA5E9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Arial',
}

const loginCard = {
  background: 'white',
  padding: 40,
  borderRadius: 28,
  width: 420,
  textAlign: 'center' as const,
  boxShadow: '0 30px 80px rgba(0,0,0,.25)',
}

const loginLogo = { width: 170, height: 170, objectFit: 'contain' as const, marginBottom: 10 }
const loginTitle = { color: '#111827', marginBottom: 6 }
const loginSub = { color: '#6B7280', marginBottom: 25 }

const loginInput = {
  width: '100%',
  padding: 15,
  borderRadius: 12,
  border: '1px solid #D1D5DB',
  marginBottom: 14,
  fontSize: 16,
  color: '#111827',
}

const loginButton = {
  width: '100%',
  padding: 15,
  borderRadius: 12,
  border: 'none',
  background: '#0EA5E9',
  color: 'white',
  fontSize: 17,
  cursor: 'pointer',
}

const page = { display: 'flex', minHeight: '100vh', background: '#F4F7FA', color: '#111827', fontFamily: 'Arial' }
const sidebar = { width: 320, background: '#081126', padding: 26, color: 'white' }

const brandBox = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  marginBottom: 36,
  background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))',
  padding: 24,
  borderRadius: 28,
  border: '1px solid rgba(255,255,255,.08)',
  overflow: 'hidden' as const,
}

const logoImage = {
  width: 180,
  height: 180,
  objectFit: 'contain' as const,
  background: 'transparent',
  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,.30))',
}

const logo = { margin: 0, fontSize: 26 }
const sideText = { color: '#9CA3AF', marginTop: 6 }

const menu = {
  width: '100%',
  padding: 18,
  border: 'none',
  borderRadius: 16,
  marginBottom: 12,
  color: 'white',
  fontSize: 18,
  textAlign: 'left' as const,
  cursor: 'pointer',
}

const logoutButton = { ...menu, background: '#EF4444', marginTop: 30 }
const main = { flex: 1, padding: 40 }
const title = { fontSize: 42, color: '#111827' }
const cards = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }
const card = { background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,.06)' }
const box = { background: 'white', padding: 28, borderRadius: 20, marginTop: 25, boxShadow: '0 10px 30px rgba(0,0,0,.06)', overflowX: 'auto' as const }
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }

const input = {
  width: '100%',
  padding: 14,
  borderRadius: 10,
  border: '1px solid #D1D5DB',
  background: 'white',
  color: '#111827',
  fontSize: 16,
  marginBottom: 12,
}

const inputSmall = {
  padding: 12,
  borderRadius: 10,
  border: '1px solid #D1D5DB',
  background: 'white',
  color: '#111827',
  fontSize: 15,
}

const miniInput = {
  padding: 8,
  borderRadius: 8,
  border: '1px solid #D1D5DB',
  background: 'white',
  color: '#111827',
  fontSize: 13,
  minWidth: 120,
}

const sectionTitle = {
  background: '#EAF7FC',
  color: '#0369A1',
  padding: '12px 16px',
  borderRadius: 12,
  marginBottom: 18,
  marginTop: 24,
  fontSize: 18,
  border: '1px solid #BAE6FD',
}

const profitCard = {
  background: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: 14,
  padding: 16,
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  gap: 6,
  marginBottom: 12,
}

const modalOverlay = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0,0,0,.45)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
}

const modalBox = {
  width: 'min(1100px, 95vw)',
  maxHeight: '90vh',
  overflowY: 'auto' as const,
  background: 'white',
  borderRadius: 24,
  padding: 28,
  boxShadow: '0 30px 90px rgba(0,0,0,.35)',
}

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #E5E7EB',
  paddingBottom: 18,
  marginBottom: 20,
}

const detailGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 14,
}

const detailItem = {
  background: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: 14,
  padding: 14,
  minHeight: 72,
}

const detailLabel = {
  display: 'block',
  color: '#6B7280',
  fontSize: 13,
  marginBottom: 6,
}

const detailValue = {
  color: '#111827',
  fontSize: 15,
  wordBreak: 'break-word' as const,
}

const button = { padding: 14, borderRadius: 12, background: '#0EA5E9', color: 'white', border: 'none', cursor: 'pointer', marginRight: 10 }
const grayButton = { ...button, background: '#6B7280' }
const table = { width: '100%', borderCollapse: 'collapse' as const }

const th = {
  textAlign: 'left' as const,
  padding: 12,
  borderBottom: '1px solid #E5E7EB',
  color: '#374151',
}

const td = {
  padding: 12,
  borderBottom: '1px solid #E5E7EB',
  color: '#111827',
}

const smallBlue = { ...button, padding: '8px 10px', marginBottom: 4 }
const smallGray = { ...smallBlue, background: '#6B7280' }
const smallGreen = { ...smallBlue, background: '#22C55E' }
const smallRed = { ...smallBlue, background: '#EF4444' }

const toolbar = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  marginBottom: 20,
}

const defRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 10,
  borderBottom: '1px solid #E5E7EB',
  listStyle: 'none',
}