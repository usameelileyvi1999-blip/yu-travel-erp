"use client";

import { useEffect, useMemo, useState } from "react";

type Reservation = {
  id: string;
  voucherNo: string;
  guestName: string;
  phone: string;
  agency: string;
  adults: string;
  children: string;
  infants: string;
  note: string;

  hasHotel: boolean;
  hasArrival: boolean;
  hasDeparture: boolean;
  hasTour: boolean;
  hasFlight: boolean;

  hotelName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  boardType: string;

  arrivalDate: string;
  arrivalTime: string;
  arrivalFlight: string;
  arrivalAirport: string;
  arrivalHotel: string;
  arrivalVehicle: string;

  departureDate: string;
  departureTime: string;
  departureFlight: string;
  departureHotel: string;
  departureAirport: string;
  departureVehicle: string;

  tourDate: string;
  tourName: string;
  tourTime: string;
  tourVehicle: string;

  flightPnr: string;
  flightAirline: string;
  flightRoute: string;
  flightDate: string;

  createdAt: string;
};

const emptyForm: Reservation = {
  id: "",
  voucherNo: "",
  guestName: "",
  phone: "",
  agency: "",
  adults: "2",
  children: "0",
  infants: "0",
  note: "",

  hasHotel: false,
  hasArrival: false,
  hasDeparture: false,
  hasTour: false,
  hasFlight: false,

  hotelName: "",
  checkIn: "",
  checkOut: "",
  roomType: "",
  boardType: "",

  arrivalDate: "",
  arrivalTime: "",
  arrivalFlight: "",
  arrivalAirport: "AYT - Antalya Airport",
  arrivalHotel: "",
  arrivalVehicle: "Vito",

  departureDate: "",
  departureTime: "",
  departureFlight: "",
  departureHotel: "",
  departureAirport: "AYT - Antalya Airport",
  departureVehicle: "Vito",

  tourDate: "",
  tourName: "",
  tourTime: "",
  tourVehicle: "Vito",

  flightPnr: "",
  flightAirline: "",
  flightRoute: "",
  flightDate: "",

  createdAt: "",
};

function createVoucherNo() {
  const now = new Date();
  const number = now.getTime().toString().slice(-6);
  return `YU-${number}`;
}

function loadReservations(): Reservation[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem("yu_reservations");
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveReservations(data: Reservation[]) {
  localStorage.setItem("yu_reservations", JSON.stringify(data));
}

export default function ReservationWorkspace({
  mode,
}: {
  mode:
    | "new"
    | "list"
    | "arrival"
    | "departure"
    | "hotel"
    | "tour"
    | "voucher";
}) {
  const [form, setForm] = useState<Reservation>({
    ...emptyForm,
    voucherNo: createVoucherNo(),
  });

  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    setReservations(loadReservations());
  }, []);

  function updateField<K extends keyof Reservation>(
    key: K,
    value: Reservation[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSave() {
    if (!form.guestName.trim()) {
      alert("Misafir adı zorunlu.");
      return;
    }

    if (
      !form.hasHotel &&
      !form.hasArrival &&
      !form.hasDeparture &&
      !form.hasTour &&
      !form.hasFlight
    ) {
      alert("En az bir hizmet seçmelisin.");
      return;
    }

    const newReservation: Reservation = {
      ...form,
      id: crypto.randomUUID(),
      voucherNo: form.voucherNo || createVoucherNo(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newReservation, ...reservations];
    setReservations(updated);
    saveReservations(updated);

    alert("Rezervasyon kaydedildi. Operasyonlara otomatik düşürüldü.");

    setForm({
      ...emptyForm,
      voucherNo: createVoucherNo(),
    });
  }

  function deleteReservation(id: string) {
    const updated = reservations.filter((item) => item.id !== id);
    setReservations(updated);
    saveReservations(updated);
  }

  const filteredReservations = useMemo(() => {
    if (mode === "arrival") return reservations.filter((item) => item.hasArrival);
    if (mode === "departure")
      return reservations.filter((item) => item.hasDeparture);
    if (mode === "hotel") return reservations.filter((item) => item.hasHotel);
    if (mode === "tour") return reservations.filter((item) => item.hasTour);
    if (mode === "voucher") return reservations;
    return reservations;
  }, [mode, reservations]);

  if (mode === "new") {
    return (
      <div className="workspace">
        <div className="page-title-bar">
          <h1>Yeni Rezervasyon</h1>
          <span>
            Tek rezervasyon içinde otel, geliş, dönüş, tur ve uçak bileti
            hizmetlerini oluştur.
          </span>
        </div>

        <div className="reservation-form">
          <section className="form-section">
            <h2>1. Misafir Bilgileri</h2>

            <div className="form-grid">
              <label>
                Voucher No
                <input
                  value={form.voucherNo}
                  onChange={(e) => updateField("voucherNo", e.target.value)}
                />
              </label>

              <label>
                Misafir Adı
                <input
                  value={form.guestName}
                  onChange={(e) => updateField("guestName", e.target.value)}
                  placeholder="Ahmed Ali"
                />
              </label>

              <label>
                Telefon
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+964..."
                />
              </label>

              <label>
                Acenta
                <input
                  value={form.agency}
                  onChange={(e) => updateField("agency", e.target.value)}
                  placeholder="Acenta adı"
                />
              </label>

              <label>
                Yetişkin
                <input
                  type="number"
                  value={form.adults}
                  onChange={(e) => updateField("adults", e.target.value)}
                />
              </label>

              <label>
                Çocuk
                <input
                  type="number"
                  value={form.children}
                  onChange={(e) => updateField("children", e.target.value)}
                />
              </label>

              <label>
                Bebek
                <input
                  type="number"
                  value={form.infants}
                  onChange={(e) => updateField("infants", e.target.value)}
                />
              </label>

              <label>
                Not
                <input
                  value={form.note}
                  onChange={(e) => updateField("note", e.target.value)}
                  placeholder="Özel not"
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>2. Hizmet Seçimi</h2>

            <div className="service-select-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.hasHotel}
                  onChange={(e) => updateField("hasHotel", e.target.checked)}
                />
                Otel
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.hasArrival}
                  onChange={(e) => updateField("hasArrival", e.target.checked)}
                />
                Geliş Transferi
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.hasDeparture}
                  onChange={(e) =>
                    updateField("hasDeparture", e.target.checked)
                  }
                />
                Dönüş Transferi
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.hasTour}
                  onChange={(e) => updateField("hasTour", e.target.checked)}
                />
                Tur
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.hasFlight}
                  onChange={(e) => updateField("hasFlight", e.target.checked)}
                />
                Uçak Bileti
              </label>
            </div>
          </section>

          {form.hasHotel && (
            <section className="form-section service-box">
              <h2>Otel Bilgileri</h2>

              <div className="form-grid">
                <label>
                  Otel Adı
                  <input
                    value={form.hotelName}
                    onChange={(e) => updateField("hotelName", e.target.value)}
                    placeholder="Hotel name"
                  />
                </label>

                <label>
                  Giriş Tarihi
                  <input
                    type="date"
                    value={form.checkIn}
                    onChange={(e) => updateField("checkIn", e.target.value)}
                  />
                </label>

                <label>
                  Çıkış Tarihi
                  <input
                    type="date"
                    value={form.checkOut}
                    onChange={(e) => updateField("checkOut", e.target.value)}
                  />
                </label>

                <label>
                  Oda Tipi
                  <input
                    value={form.roomType}
                    onChange={(e) => updateField("roomType", e.target.value)}
                    placeholder="Standard / Family / Suite"
                  />
                </label>

                <label>
                  Pansiyon
                  <input
                    value={form.boardType}
                    onChange={(e) => updateField("boardType", e.target.value)}
                    placeholder="BB / HB / AI / UAI"
                  />
                </label>
              </div>
            </section>
          )}

          {form.hasArrival && (
            <section className="form-section service-box">
              <h2>Geliş Transferi</h2>

              <div className="form-grid">
                <label>
                  Geliş Tarihi
                  <input
                    type="date"
                    value={form.arrivalDate}
                    onChange={(e) => updateField("arrivalDate", e.target.value)}
                  />
                </label>

                <label>
                  Geliş Saati
                  <input
                    type="time"
                    value={form.arrivalTime}
                    onChange={(e) => updateField("arrivalTime", e.target.value)}
                  />
                </label>

                <label>
                  Uçuş No
                  <input
                    value={form.arrivalFlight}
                    onChange={(e) =>
                      updateField("arrivalFlight", e.target.value)
                    }
                    placeholder="IA123"
                  />
                </label>

                <label>
                  Havalimanı
                  <input
                    value={form.arrivalAirport}
                    onChange={(e) =>
                      updateField("arrivalAirport", e.target.value)
                    }
                  />
                </label>

                <label>
                  Otel / Bölge
                  <input
                    value={form.arrivalHotel}
                    onChange={(e) => updateField("arrivalHotel", e.target.value)}
                    placeholder="Lara / Kundu / Belek"
                  />
                </label>

                <label>
                  Araç Tipi
                  <select
                    value={form.arrivalVehicle}
                    onChange={(e) =>
                      updateField("arrivalVehicle", e.target.value)
                    }
                  >
                    <option>Vito</option>
                    <option>Sprinter</option>
                    <option>Sedan</option>
                    <option>VIP</option>
                    <option>Otobüs</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          {form.hasDeparture && (
            <section className="form-section service-box">
              <h2>Dönüş Transferi</h2>

              <div className="form-grid">
                <label>
                  Dönüş Tarihi
                  <input
                    type="date"
                    value={form.departureDate}
                    onChange={(e) =>
                      updateField("departureDate", e.target.value)
                    }
                  />
                </label>

                <label>
                  Dönüş Saati
                  <input
                    type="time"
                    value={form.departureTime}
                    onChange={(e) =>
                      updateField("departureTime", e.target.value)
                    }
                  />
                </label>

                <label>
                  Uçuş No
                  <input
                    value={form.departureFlight}
                    onChange={(e) =>
                      updateField("departureFlight", e.target.value)
                    }
                    placeholder="IA456"
                  />
                </label>

                <label>
                  Otel
                  <input
                    value={form.departureHotel}
                    onChange={(e) =>
                      updateField("departureHotel", e.target.value)
                    }
                  />
                </label>

                <label>
                  Havalimanı
                  <input
                    value={form.departureAirport}
                    onChange={(e) =>
                      updateField("departureAirport", e.target.value)
                    }
                  />
                </label>

                <label>
                  Araç Tipi
                  <select
                    value={form.departureVehicle}
                    onChange={(e) =>
                      updateField("departureVehicle", e.target.value)
                    }
                  >
                    <option>Vito</option>
                    <option>Sprinter</option>
                    <option>Sedan</option>
                    <option>VIP</option>
                    <option>Otobüs</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          {form.hasTour && (
            <section className="form-section service-box">
              <h2>Tur Bilgileri</h2>

              <div className="form-grid">
                <label>
                  Tur Tarihi
                  <input
                    type="date"
                    value={form.tourDate}
                    onChange={(e) => updateField("tourDate", e.target.value)}
                  />
                </label>

                <label>
                  Tur Adı
                  <input
                    value={form.tourName}
                    onChange={(e) => updateField("tourName", e.target.value)}
                    placeholder="Antalya City Tour"
                  />
                </label>

                <label>
                  Alış Saati
                  <input
                    type="time"
                    value={form.tourTime}
                    onChange={(e) => updateField("tourTime", e.target.value)}
                  />
                </label>

                <label>
                  Araç Tipi
                  <select
                    value={form.tourVehicle}
                    onChange={(e) => updateField("tourVehicle", e.target.value)}
                  >
                    <option>Vito</option>
                    <option>Sprinter</option>
                    <option>Sedan</option>
                    <option>VIP</option>
                    <option>Otobüs</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          {form.hasFlight && (
            <section className="form-section service-box">
              <h2>Uçak Bileti</h2>

              <div className="form-grid">
                <label>
                  PNR
                  <input
                    value={form.flightPnr}
                    onChange={(e) => updateField("flightPnr", e.target.value)}
                    placeholder="ABC123"
                  />
                </label>

                <label>
                  Havayolu
                  <input
                    value={form.flightAirline}
                    onChange={(e) =>
                      updateField("flightAirline", e.target.value)
                    }
                    placeholder="Iraqi Airways"
                  />
                </label>

                <label>
                  Rota
                  <input
                    value={form.flightRoute}
                    onChange={(e) => updateField("flightRoute", e.target.value)}
                    placeholder="Baghdad - Antalya"
                  />
                </label>

                <label>
                  Uçuş Tarihi
                  <input
                    type="date"
                    value={form.flightDate}
                    onChange={(e) => updateField("flightDate", e.target.value)}
                  />
                </label>
              </div>
            </section>
          )}

          <div className="form-actions">
            <button className="primary-button" onClick={handleSave}>
              Rezervasyonu Kaydet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace">
      <div className="page-title-bar">
        <h1>
          {mode === "list" && "Rezervasyon Listesi"}
          {mode === "arrival" && "Geliş Operasyonu"}
          {mode === "departure" && "Dönüş Operasyonu"}
          {mode === "hotel" && "Otel Operasyonu"}
          {mode === "tour" && "Tur Operasyonu"}
          {mode === "voucher" && "Voucher Listesi"}
        </h1>
        <span>
          Kayıtlar tarayıcıda geçici olarak tutulur. Sonraki aşamada Supabase
          veritabanına bağlanacak.
        </span>
      </div>

      <div className="sejour-table-card">
        <div className="table-header">
          <strong>Toplam Kayıt: {filteredReservations.length}</strong>
          <span>YU Travel operasyon takibi</span>
        </div>

        <div className="table-wrapper">
          <table className="sejour-table">
            <thead>
              <tr>
                <th>Voucher</th>
                <th>Misafir</th>
                <th>Acenta</th>
                <th>Pax</th>
                <th>Hizmetler</th>
                <th>Tarih / Saat</th>
                <th>Detay</th>
                <th>İşlem</th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={8}>Henüz kayıt yok.</td>
                </tr>
              )}

              {filteredReservations.map((item) => {
                const services = [
                  item.hasHotel ? "Otel" : "",
                  item.hasArrival ? "Geliş" : "",
                  item.hasDeparture ? "Dönüş" : "",
                  item.hasTour ? "Tur" : "",
                  item.hasFlight ? "Uçak" : "",
                ]
                  .filter(Boolean)
                  .join(" + ");

                let dateText = "-";
                let detailText = "-";

                if (mode === "arrival") {
                  dateText = `${item.arrivalDate || "-"} ${
                    item.arrivalTime || ""
                  }`;
                  detailText = `${item.arrivalFlight || "-"} / ${
                    item.arrivalAirport || "-"
                  } → ${item.arrivalHotel || "-"}`;
                } else if (mode === "departure") {
                  dateText = `${item.departureDate || "-"} ${
                    item.departureTime || ""
                  }`;
                  detailText = `${item.departureHotel || "-"} → ${
                    item.departureAirport || "-"
                  } / ${item.departureFlight || "-"}`;
                } else if (mode === "hotel") {
                  dateText = `${item.checkIn || "-"} / ${item.checkOut || "-"}`;
                  detailText = `${item.hotelName || "-"} / ${
                    item.roomType || "-"
                  } / ${item.boardType || "-"}`;
                } else if (mode === "tour") {
                  dateText = `${item.tourDate || "-"} ${item.tourTime || ""}`;
                  detailText = `${item.tourName || "-"} / ${
                    item.tourVehicle || "-"
                  }`;
                } else {
                  dateText = `${item.checkIn || item.arrivalDate || "-"} / ${
                    item.checkOut || item.departureDate || "-"
                  }`;
                  detailText = services || "-";
                }

                return (
                  <tr key={item.id}>
                    <td>{item.voucherNo}</td>
                    <td>{item.guestName}</td>
                    <td>{item.agency || "-"}</td>
                    <td>
                      {item.adults} Y / {item.children} Ç / {item.infants} B
                    </td>
                    <td>{services}</td>
                    <td>{dateText}</td>
                    <td>{detailText}</td>
                    <td>
                      <button
                        className="small-danger-button"
                        onClick={() => deleteReservation(item.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {mode === "voucher" && filteredReservations[0] && (
        <div className="voucher-preview">
          <h2>Voucher Önizleme</h2>
          <p>
            Bu bölüm sonraki adımda PDF ve WhatsApp formatına çevrilecek. Şu an
            kayıtların tek voucher mantığında birleştiğini gösterir.
          </p>
        </div>
      )}
    </div>
  );
}
