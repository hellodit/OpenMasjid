/* global React, Icons, CATEGORIES, EVENTS, ATTENDEES, StatusBadge, Stat, thumbColor */
const { useState, useMemo } = React;

/* ============================================================
   DASHBOARD
   ============================================================ */
function DashboardView({ openDetail, setRoute }) {
  const today = EVENTS.slice(0, 3);
  return (
    <div className="page" style={{ color: "red" }}>
      <div className="page-narrow">
        <div className="dash-hero">
          <div className="pattern-strip"></div>
          <div>
            <div className="salam">Assalamu'alaikum Warahmatullah</div>
            <h1>Selamat datang, H. Sulaiman</h1>
            <p>Hari ini ada 3 kegiatan terjadwal di Masjid Al-Hikmah. Total 142 jamaah telah mendaftar untuk pekan ini.</p>
            <div className="ar-greeting">بَارَكَ اللَّهُ فِيْكُمْ</div>
          </div>
          <div className="prayer-card">
            <div className="pc-head">
              <span>Jadwal Sholat — Ahad, 17 Mei</span>
              <span style={{ color: "var(--gold)" }}>● Live</span>
            </div>
            <div className="pc-grid">
              <div className="item"><div className="nm">Subuh</div><div className="tm">04:32</div></div>
              <div className="item"><div className="nm">Dzuhur</div><div className="tm">11:54</div></div>
              <div className="item now"><div className="nm">Ashar</div><div className="tm">15:18</div></div>
              <div className="item"><div className="nm">Maghrib</div><div className="tm">17:51</div></div>
              <div className="item"><div className="nm">Isya</div><div className="tm">19:04</div></div>
            </div>
          </div>
        </div>

        <div className="stats">
          <Stat label="Kegiatan Aktif" num="48" delta="6 minggu ini" Icon={Icons.Calendar} />
          <Stat label="Jamaah Terdaftar" num="1.284" delta="84 baru" tone="info" Icon={Icons.Users} />
          <Stat label="Donasi Bulan Ini" num="Rp 18,4 jt" delta="11% naik" tone="gold" Icon={Icons.Heart} />
          <Stat label="Tingkat Kehadiran" num="87%" delta="3 poin" tone="rose" Icon={Icons.TrendUp} />
        </div>

        <div className="dash-grid">
          <div>
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Kegiatan Hari Ini</h3>
                  <p className="panel-sub">Jadwal yang berlangsung dalam 24 jam ke depan.</p>
                </div>
                <button className="btn sm" onClick={() => setRoute("list")}>Lihat semua →</button>
              </div>
              <div className="today-list">
                {today.map((ev) =>
                <div key={ev.id} className="today-item" onClick={() => openDetail(ev.id)}>
                    <div className="time-block">
                      <div className="h">{ev.time.split("—")[1]?.trim().split(":")[0] || "19"}</div>
                      <div className="m">{ev.time.split(" ")[0] === "Ba'da" ? ev.time.split(" ")[1] : "WIB"}</div>
                    </div>
                    <div>
                      <div className="nm">{ev.title}</div>
                      <div className="sub">
                        <span><Icons.Mic size={12} /> {ev.speaker}</span>
                        <span style={{ color: "var(--border-strong)" }}>•</span>
                        <span><Icons.MapPin size={12} /> {ev.location}</span>
                      </div>
                    </div>
                    <StatusBadge status={ev.status} />
                  </div>
                )}
              </div>
            </div>

            <div className="spacer-2"></div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Pendaftar 7 Hari Terakhir</h3>
                  <p className="panel-sub">Jumlah jamaah yang mendaftar pada kegiatan masjid.</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--muted)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg, var(--green-500), var(--green-700))" }}></span>
                    Pekan ini
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg, var(--gold), oklch(0.55 0.12 78))" }}></span>
                    Pekan lalu
                  </span>
                </div>
              </div>
              <div className="bar-chart">
                {[
                { l: "Sen", v: 24, t: 18 },
                { l: "Sel", v: 38, t: 22 },
                { l: "Rab", v: 42, t: 30 },
                { l: "Kam", v: 28, t: 25 },
                { l: "Jum", v: 56, t: 40 },
                { l: "Sab", v: 48, t: 35 },
                { l: "Ahd", v: 62, t: 45 }].
                map((b, i) =>
                <div key={i} className="bar">
                    <div style={{ width: "100%", display: "flex", gap: 4, alignItems: "end", height: 130 }}>
                      <div className="col" style={{ height: b.v / 65 * 100 + "%" }}><span className="v">{b.v}</span></div>
                      <div className="col accent" style={{ height: b.t / 65 * 100 + "%", width: "50%" }}></div>
                    </div>
                    <div className="lbl">{b.l}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="panel">
              <h3>Distribusi Kategori</h3>
              <p className="panel-sub" style={{ marginBottom: 16 }}>48 kegiatan total bulan ini</p>
              <div className="donut">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="56" fill="none" stroke="var(--green-100)" strokeWidth="18" />
                  <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.45 0.10 155)" strokeWidth="18"
                  strokeDasharray="140 352" strokeDashoffset="0" strokeLinecap="round" />
                  <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.50 0.09 200)" strokeWidth="18"
                  strokeDasharray="80 352" strokeDashoffset="-140" strokeLinecap="round" />
                  <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.60 0.10 78)" strokeWidth="18"
                  strokeDasharray="65 352" strokeDashoffset="-220" strokeLinecap="round" />
                  <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.50 0.10 30)" strokeWidth="18"
                  strokeDasharray="40 352" strokeDashoffset="-285" strokeLinecap="round" />
                </svg>
                <div className="donut-c">
                  <div className="v">48</div>
                  <div className="l">Kegiatan</div>
                </div>
              </div>
              <div className="legend">
                <div className="row"><span className="sw" style={{ background: "oklch(0.45 0.10 155)" }}></span><span className="lb">Kajian Rutin</span><span className="vl">18</span></div>
                <div className="row"><span className="sw" style={{ background: "oklch(0.50 0.09 200)" }}></span><span className="lb">Tahsin & Tahfidz</span><span className="vl">11</span></div>
                <div className="row"><span className="sw" style={{ background: "oklch(0.60 0.10 78)" }}></span><span className="lb">TPA / TPQ</span><span className="vl">9</span></div>
                <div className="row"><span className="sw" style={{ background: "oklch(0.50 0.10 30)" }}></span><span className="lb">Zakat & Sosial</span><span className="vl">6</span></div>
                <div className="row"><span className="sw" style={{ background: "var(--border-strong)" }}></span><span className="lb">Lainnya</span><span className="vl">4</span></div>
              </div>
            </div>

            <div className="spacer-2"></div>

            <div className="panel">
              <h3>Aktivitas Terkini</h3>
              <p className="panel-sub" style={{ marginBottom: 14 }}>Riwayat operasional CMS</p>
              <div className="activity-feed">
                <div className="item">
                  <div className="ico"><Icons.Plus size={14} /></div>
                  <div>
                    <div className="t"><b>Ust. Faris</b> menambah kegiatan baru: <b>Kelas Bahasa Arab</b></div>
                    <div className="when">5 menit lalu</div>
                  </div>
                </div>
                <div className="item">
                  <div className="ico gold"><Icons.Users size={14} /></div>
                  <div>
                    <div className="t"><b>Sdr. Rifki</b> mendaftar pada <b>Kajian Tafsir Al-Mulk</b></div>
                    <div className="when">22 menit lalu</div>
                  </div>
                </div>
                <div className="item">
                  <div className="ico"><Icons.Check size={14} /></div>
                  <div>
                    <div className="t"><b>Tahsin Tilawah Pemula</b> kapasitas mencapai 95%</div>
                    <div className="when">1 jam lalu</div>
                  </div>
                </div>
                <div className="item">
                  <div className="ico rose"><Icons.Heart size={14} /></div>
                  <div>
                    <div className="t">Donasi <b>Rp 2.500.000</b> diterima dari Bapak Ahmad</div>
                    <div className="when">3 jam lalu</div>
                  </div>
                </div>
                <div className="item">
                  <div className="ico"><Icons.Edit size={14} /></div>
                  <div>
                    <div className="t"><b>H. Sulaiman</b> memperbarui <b>Tabligh Akbar</b></div>
                    <div className="when">5 jam lalu</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="spacer-2"></div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Donasi Aktif</h3>
                  <p className="panel-sub">Pengumpulan dana terkini</p>
                </div>
              </div>
              <div className="donation-bar">
                <div className="top">
                  <div className="nm">Renovasi Atap Selatan</div>
                  <div className="vl">Rp 32 jt</div>
                </div>
                <div className="meter"><i style={{ width: "64%" }}></i></div>
                <div className="pct">64% dari Rp 50 jt — 23 hari tersisa</div>
              </div>
              <div className="donation-bar">
                <div className="top">
                  <div className="nm">Beasiswa Santri TPA</div>
                  <div className="vl">Rp 12,8 jt</div>
                </div>
                <div className="meter"><i style={{ width: "85%" }}></i></div>
                <div className="pct">85% dari Rp 15 jt — 8 hari tersisa</div>
              </div>
              <div className="donation-bar">
                <div className="top">
                  <div className="nm">Iftar Ramadhan 1448 H</div>
                  <div className="vl">Rp 4,2 jt</div>
                </div>
                <div className="meter"><i style={{ width: "21%" }}></i></div>
                <div className="pct">21% dari Rp 20 jt — 156 hari tersisa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}

/* ============================================================
   KATEGORI
   ============================================================ */
function KategoriView() {
  const cats = [
  { id: "kajian", name: "Kajian Rutin", ar: "الدُّرُوس", desc: "Kajian rutin pekanan dan bulanan dari kitab-kitab utama serta tafsir.", events: 18, attend: 472, growth: "+12%" },
  { id: "tahsin", name: "Tahsin & Tahfidz", ar: "تحفيظ القرآن", desc: "Program tahsin tilawah dan tahfidz untuk seluruh kalangan jamaah.", events: 11, attend: 286, growth: "+8%" },
  { id: "tpa", name: "TPA / TPQ", ar: "تربية الأطفال", desc: "Pendidikan Al-Qur'an untuk anak usia dini hingga remaja.", events: 9, attend: 184, growth: "+4%" },
  { id: "zakat", name: "Zakat & Sosial", ar: "الزكاة والإحسان", desc: "Penyaluran zakat, infaq, sedekah, dan kegiatan sosial kemasyarakatan.", events: 6, attend: 98, growth: "+22%" },
  { id: "muharram", name: "Hari Besar Islam", ar: "أيام إسلامية", desc: "Peringatan hari-hari besar Islam: Maulid, Isra Mi'raj, Tahun Baru Hijriyah.", events: 3, attend: 1240, growth: "+35%" },
  { id: "umum", name: "Lainnya", ar: "أخرى", desc: "Kegiatan umum yang belum dikategorikan secara spesifik.", events: 1, attend: 12, growth: "—" }];


  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-header">
          <div className="page-title-block">
            <div className="eyebrow">Manajemen Kategori</div>
            <h1>Kategori Kegiatan</h1>
            <p>Pisahkan kegiatan ke dalam kategori untuk memudahkan pencarian dan pelaporan kepada DKM.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn"><Icons.Filter size={16} /> Filter</button>
            <button className="btn primary"><Icons.Plus size={16} /> Kategori Baru</button>
          </div>
        </div>

        <div className="stats">
          <Stat label="Total Kategori" num="6" Icon={Icons.Tag} />
          <Stat label="Kategori Aktif" num="6" tone="info" Icon={Icons.Check} />
          <Stat label="Paling Populer" num="Kajian" tone="gold" Icon={Icons.TrendUp} />
          <Stat label="Hadirin Total" num="2.292" tone="rose" Icon={Icons.Users} />
        </div>

        <div className="cat-board">
          {cats.map((c) => {
            const def = CATEGORIES.find((x) => x.id === c.id);
            return (
              <div key={c.id} className="cat-card" style={{ background: thumbColor(c.id) }}>
                <div className="pattern-strip"></div>
                <div className="head">
                  <div className="ico-big"><def.Icon size={24} /></div>
                  <button className="menu-btn"><Icons.Settings size={14} /></button>
                </div>
                <h3>{c.name}</h3>
                <div className="ar" style={{ fontFamily: "serif" }}>{c.ar}</div>
                <div className="desc">{c.desc}</div>
                <div className="stats">
                  <div className="stat-mini"><div className="l">Kegiatan</div><div className="v">{c.events}</div></div>
                  <div className="stat-mini"><div className="l">Hadirin</div><div className="v">{c.attend}</div></div>
                  <div className="stat-mini"><div className="l">Tren</div><div className="v">{c.growth}</div></div>
                </div>
              </div>);

          })}
          <div className="cat-card add">
            <div className="ico-big"><Icons.Plus size={24} /></div>
            <h3>Tambah Kategori</h3>
            <div className="desc">Buat kategori baru untuk mengelompokkan kegiatan masjid Anda.</div>
          </div>
        </div>
      </div>
    </div>);

}

/* ============================================================
   PENDAFTAR
   ============================================================ */
function PendaftarView() {
  const regs = [
  { name: "Bapak Hidayat Wibowo", email: "hidayat.w@gmail.com", phone: "+62 812-1111-2222", event: "Kajian Tafsir Al-Mulk", cat: "kajian", date: "12 Mei 2026", status: "confirmed", when: "2 jam lalu" },
  { name: "Ibu Sumarni Lestari", email: "sumarni@warga.id", phone: "+62 813-2222-3333", event: "Tahsin Tilawah Pemula", cat: "tahsin", date: "13 Mei 2026", status: "attended", when: "5 jam lalu" },
  { name: "Sdr. Rifki Nugroho", email: "rifki.n@gmail.com", phone: "+62 821-3333-4444", event: "Kajian Tafsir Al-Mulk", cat: "kajian", date: "12 Mei 2026", status: "confirmed", when: "1 hari lalu" },
  { name: "Bapak Sutopo Hadi", email: "sutopo.h@gmail.com", phone: "+62 822-4444-5555", event: "Buka Pendaftaran TPA", cat: "tpa", date: "15 Mei 2026", status: "pending", when: "1 hari lalu" },
  { name: "Ibu Aisyah Rahmani", email: "aisyah@warga.id", phone: "+62 823-5555-6666", event: "Penyaluran Zakat Maal", cat: "zakat", date: "17 Mei 2026", status: "confirmed", when: "2 hari lalu" },
  { name: "Sdr. Bagus Pratama", email: "bagus.p@gmail.com", phone: "+62 856-6666-7777", event: "Kelas Bahasa Arab Dasar", cat: "kajian", date: "21 Mei 2026", status: "confirmed", when: "2 hari lalu" },
  { name: "Ibu Khairunnisa", email: "nisa.k@gmail.com", phone: "+62 857-7777-8888", event: "Tahsin Tilawah Pemula", cat: "tahsin", date: "13 Mei 2026", status: "attended", when: "3 hari lalu" },
  { name: "Bapak Iskandar Maulana", email: "iskandar.m@gmail.com", phone: "+62 858-8888-9999", event: "Tabligh Akbar Hijriyah", cat: "muharram", date: "20 Jul 2026", status: "pending", when: "3 hari lalu" },
  { name: "Sdr. Faris Akbar", email: "faris.a@gmail.com", phone: "+62 859-9999-0000", event: "Kajian Tafsir Al-Mulk", cat: "kajian", date: "12 Mei 2026", status: "cancelled", when: "4 hari lalu" },
  { name: "Ibu Halimah Yusuf", email: "halimah.y@warga.id", phone: "+62 851-0000-1111", event: "Penyaluran Zakat Maal", cat: "zakat", date: "17 Mei 2026", status: "confirmed", when: "5 hari lalu" }];


  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());

  const filtered = filter === "all" ? regs : regs.filter((r) => r.status === filter);

  const toggle = (i) => {
    const s = new Set(selected);
    s.has(i) ? s.delete(i) : s.add(i);
    setSelected(s);
  };
  const allOn = filtered.length > 0 && filtered.every((_, i) => selected.has(i));
  const toggleAll = () => {
    if (allOn) setSelected(new Set());else
    setSelected(new Set(filtered.map((_, i) => i)));
  };

  const stMap = {
    confirmed: "Terkonfirmasi",
    pending: "Menunggu",
    attended: "Hadir",
    cancelled: "Dibatalkan"
  };

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-header">
          <div className="page-title-block">
            <div className="eyebrow">Manajemen Pendaftar</div>
            <h1>Daftar Pendaftar Kegiatan</h1>
            <p>Kelola jamaah yang mendaftar pada seluruh kegiatan masjid. Konfirmasi, batalkan, atau hubungi langsung.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn"><Icons.Download size={16} /> Ekspor CSV</button>
            <button className="btn primary"><Icons.Plus size={16} /> Tambah Manual</button>
          </div>
        </div>

        <div className="stats">
          <Stat label="Total Pendaftar" num="1.284" delta="84 minggu ini" Icon={Icons.Users} />
          <Stat label="Terkonfirmasi" num="892" delta="69%" tone="info" Icon={Icons.Check} />
          <Stat label="Hadir" num="724" delta="56%" tone="gold" Icon={Icons.Eye} />
          <Stat label="Dibatalkan" num="48" delta="3,7%" tone="rose" Icon={Icons.X} />
        </div>

        <div className="toolbar">
          <div className="group">
            {[
            { id: "all", l: "Semua", n: regs.length },
            { id: "confirmed", l: "Terkonfirmasi", n: regs.filter((r) => r.status === "confirmed").length },
            { id: "pending", l: "Menunggu", n: regs.filter((r) => r.status === "pending").length },
            { id: "attended", l: "Hadir", n: regs.filter((r) => r.status === "attended").length },
            { id: "cancelled", l: "Dibatalkan", n: regs.filter((r) => r.status === "cancelled").length }].
            map((f) =>
            <button key={f.id} className={"chip " + (filter === f.id ? "active" : "")}
            onClick={() => setFilter(f.id)}>
                {f.l} <span className="count">{f.n}</span>
              </button>
            )}
          </div>
          <div className="search-mini">
            <Icons.Search size={14} />
            <input placeholder="Cari nama atau email…" />
          </div>
          <button className="btn sm"><Icons.Filter size={14} /> Filter</button>
        </div>

        {selected.size > 0 &&
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", marginBottom: 12,
          background: "var(--green-100)", border: "1px solid oklch(0.85 0.05 155)",
          borderRadius: "var(--radius)", fontSize: 13
        }}>
            <strong>{selected.size}</strong> pendaftar dipilih
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn sm"><Icons.Check size={14} /> Konfirmasi</button>
              <button className="btn sm"><Icons.Mail size={14} /> Kirim Email</button>
              <button className="btn sm danger"><Icons.X size={14} /> Batalkan</button>
            </div>
          </div>
        }

        <table className="reg-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <div className={"check " + (allOn ? "on" : "")} onClick={toggleAll}>
                  {allOn && <Icons.Check size={12} />}
                </div>
              </th>
              <th>Pendaftar</th>
              <th>Kegiatan</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Mendaftar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) =>
            <tr key={i}>
                <td>
                  <div className={"check " + (selected.has(i) ? "on" : "")} onClick={() => toggle(i)}>
                    {selected.has(i) && <Icons.Check size={12} />}
                  </div>
                </td>
                <td>
                  <div className="person">
                    <div className="av">{r.name.split(" ").filter((w) => !["Bapak", "Ibu", "Sdr.", "Sdri."].includes(w)).map((w) => w[0]).slice(0, 2).join("")}</div>
                    <div>
                      <div className="nm">{r.name}</div>
                      <div className="em">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.event}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{CATEGORIES.find((c) => c.id === r.cat)?.name}</div>
                </td>
                <td>{r.date}</td>
                <td><span className={"reg-status " + r.status}>{stMap[r.status]}</span></td>
                <td style={{ color: "var(--muted)", fontSize: 12.5 }}>{r.when}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" title="Lihat"><Icons.Eye size={14} /></button>
                    <button className="icon-btn" title="Kirim email"><Icons.Mail size={14} /></button>
                    <button className="icon-btn" title="Hubungi"><Icons.Phone size={14} /></button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 4px", color: "var(--muted)", fontSize: 13
        }}>
          <div>Menampilkan {filtered.length} dari {regs.length} pendaftar</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn sm">‹ Sebelumnya</button>
            <button className="btn sm" style={{ background: "var(--green-700)", color: "white", borderColor: "var(--green-700)" }}>1</button>
            <button className="btn sm">2</button>
            <button className="btn sm">3</button>
            <button className="btn sm">Berikutnya ›</button>
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, { DashboardView, KategoriView, PendaftarView });