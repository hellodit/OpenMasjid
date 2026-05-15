/* global React, Icons, CATEGORIES, EVENTS, ATTENDEES, SCHEDULE */
const { useState, useMemo } = React;

/* ============================================================
   Sidebar
   ============================================================ */
function Sidebar({ route, setRoute }) {
  const items = [
    { id: "dashboard", name: "Dashboard", Icon: Icons.Grid },
    { id: "list",      name: "Kegiatan",  Icon: Icons.Calendar, count: EVENTS.length, active: true },
    { id: "kategori",  name: "Kategori",  Icon: Icons.Tag },
    { id: "pendaftar", name: "Pendaftar", Icon: Icons.Users, count: 142 },
    { id: "kajian",    name: "Materi Kajian", Icon: Icons.BookOpen },
  ];
  const settings = [
    { id: "pengaturan", name: "Pengaturan",  Icon: Icons.Settings },
    { id: "notif",      name: "Pemberitahuan", Icon: Icons.Bell, count: 3 },
  ];

  const isOn = (id) => {
    if (id === "list") return ["list", "add", "detail"].includes(route);
    return route === id;
  };
  const navigable = new Set(["dashboard", "list", "kategori", "pendaftar", "pengaturan"]);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="mark"><Icons.Star8 size={22} /></div>
        <div>
          <div className="name">Masjidku</div>
          <div className="sub">Event Management</div>
        </div>
      </div>

      <div className="sidebar-section-label">Manajemen</div>
      <nav>
        {items.map(it => (
          <button key={it.id}
            className={"nav-item " + (isOn(it.id) ? "active" : "")}
            onClick={() => navigable.has(it.id) ? setRoute(it.id) : null}>
            <it.Icon size={18} />
            <span>{it.name}</span>
            {it.count != null && <span className="badge-count">{it.count}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Sistem</div>
      <nav style={{flex: "0 0 auto", marginBottom: 12}}>
        {settings.map(it => (
          <button key={it.id}
            className={"nav-item " + (isOn(it.id) ? "active" : "")}
            onClick={() => navigable.has(it.id) ? setRoute(it.id) : null}>
            <it.Icon size={18} />
            <span>{it.name}</span>
            {it.count != null && <span className="badge-count">{it.count}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">SH</div>
        <div className="who">
          <div className="n">H. Sulaiman</div>
          <div className="r">Ketua DKM</div>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   Topbar
   ============================================================ */
function Topbar({ crumbs }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className={i === crumbs.length - 1 ? "now" : ""}>{c}</span>
            {i < crumbs.length - 1 && <Icons.ChevronRight size={14} className="sep" />}
          </React.Fragment>
        ))}
      </div>
      <div className="search">
        <Icons.Search size={16} />
        <input placeholder="Cari kegiatan, jamaah, kategori…" />
      </div>
      <button className="icon-btn" title="Notifikasi">
        <Icons.Bell size={18} />
        <span className="pulse"></span>
      </button>
      <button className="icon-btn" title="Pengaturan"><Icons.Settings size={18} /></button>
    </div>
  );
}

/* ============================================================
   Stat card
   ============================================================ */
function Stat({ label, num, delta, tone, Icon }) {
  return (
    <div className={"stat " + (tone || "")}>
      <div className="ico"><Icon size={20} /></div>
      <div className="lbl">{label}</div>
      <div className="num">{num}</div>
      {delta && <div className="delta">↑ {delta}</div>}
    </div>
  );
}

/* ============================================================
   Event card (grid)
   ============================================================ */
function EventCard({ ev, onOpen }) {
  const cat = CATEGORIES.find(c => c.id === ev.cat);
  const pct = Math.round((ev.attended / ev.capacity) * 100);
  const tone = pct >= 100 ? "full" : pct >= 80 ? "warn" : "";
  return (
    <article className="event-card" onClick={onOpen}>
      <div className={"banner " + ev.cat}>
        <div className="pattern-strip"></div>
        <div className="badge-row">
          <span className="cat">{ev.catName}</span>
          <div className="date-pill">
            <span className="d">{ev.d}</span>
            <span className="m">{ev.m}</span>
          </div>
        </div>
        <div className="ar" style={{fontFamily: "serif"}}>{ev.arabic}</div>
      </div>
      <div className="body">
        <h3>{ev.title}</h3>
        <div className="speaker">{ev.speaker}</div>
        <div className="meta">
          <div className="row"><Icons.Clock size={14} /><span>{ev.day} • {ev.time}</span></div>
          <div className="row"><Icons.MapPin size={14} /><span>{ev.location}</span></div>
        </div>
        <div className="foot">
          <StatusBadge status={ev.status} />
          <div className="capacity-bar">
            <div className="bar"><i className={tone} style={{width: Math.min(100, pct) + "%"}}></i></div>
            <span>{ev.attended}/{ev.capacity}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const map = {
    published: { lbl: "Tayang", cls: "published" },
    draft:     { lbl: "Draf",   cls: "draft" },
    ongoing:   { lbl: "Berjalan", cls: "ongoing" },
    full:      { lbl: "Penuh",  cls: "full" },
  };
  const m = map[status] || map.draft;
  return <span className={"badge " + m.cls}><span className="dot"></span>{m.lbl}</span>;
}

/* ============================================================
   List view
   ============================================================ */
function ListView({ setRoute, openDetail }) {
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      if (filter !== "all" && e.cat !== filter) return false;
      if (q && !e.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [filter, q]);

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-header">
          <div className="page-title-block">
            <div className="eyebrow">Manajemen Kegiatan</div>
            <h1>Daftar Kegiatan Masjid</h1>
            <p>Kelola seluruh kajian, kelas, dan kegiatan sosial yang diselenggarakan oleh DKM Masjid Al-Hikmah.</p>
          </div>
          <div style={{display: "flex", gap: 10}}>
            <button className="btn"><Icons.Download size={16} /> Ekspor</button>
            <button className="btn primary" onClick={() => setRoute("add")}>
              <Icons.Plus size={16} /> Tambah Kegiatan
            </button>
          </div>
        </div>

        <div className="stats">
          <Stat label="Total Kegiatan" num="48" delta="12% bulan ini" Icon={Icons.Calendar} />
          <Stat label="Sedang Berjalan" num="6" delta="2 hari ini" tone="info" Icon={Icons.Clock} />
          <Stat label="Total Pendaftar" num="1.284" delta="84 minggu ini" tone="gold" Icon={Icons.Users} />
          <Stat label="Donasi Terkumpul" num="Rp 18,4 jt" delta="Rp 2,1 jt" tone="rose" Icon={Icons.Heart} />
        </div>

        <div className="toolbar">
          <div className="group">
            <button className={"chip " + (filter==="all" ? "active" : "")} onClick={() => setFilter("all")}>
              Semua <span className="count">{EVENTS.length}</span>
            </button>
            {CATEGORIES.map(c => {
              const n = EVENTS.filter(e => e.cat === c.id).length;
              return (
                <button key={c.id} className={"chip " + (filter===c.id ? "active" : "")} onClick={() => setFilter(c.id)}>
                  <c.Icon size={13} />{c.name} <span className="count">{n}</span>
                </button>
              );
            })}
          </div>
          <div className="search-mini">
            <Icons.Search size={14} />
            <input placeholder="Cari judul…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="view-toggle">
            <button className={view==="grid" ? "active" : ""} onClick={() => setView("grid")}><Icons.Grid size={14} /></button>
            <button className={view==="list" ? "active" : ""} onClick={() => setView("list")}><Icons.List size={14} /></button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="event-grid">
            {filtered.map(ev => <EventCard key={ev.id} ev={ev} onOpen={() => openDetail(ev.id)} />)}
          </div>
        ) : (
          <ListTable events={filtered} onOpen={openDetail} />
        )}
      </div>
    </div>
  );
}

function ListTable({ events, onOpen }) {
  return (
    <table className="list-table">
      <thead>
        <tr>
          <th style={{width: "32%"}}>Kegiatan</th>
          <th>Kategori</th>
          <th>Jadwal</th>
          <th>Lokasi</th>
          <th>Kapasitas</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {events.map(ev => {
          const cat = CATEGORIES.find(c => c.id === ev.cat);
          const pct = Math.round((ev.attended / ev.capacity) * 100);
          const tone = pct >= 100 ? "full" : pct >= 80 ? "warn" : "";
          return (
            <tr key={ev.id} onClick={() => onOpen(ev.id)}>
              <td>
                <div className="ev-cell">
                  <div className={"ev-thumb " + ev.cat} style={{background: thumbColor(ev.cat)}}>
                    <div className="pattern-strip"></div>
                    <span>{ev.title.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="ev-name">{ev.title}</div>
                    <div className="ev-sub">{ev.speaker}</div>
                  </div>
                </div>
              </td>
              <td><span style={{display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-2)"}}><cat.Icon size={14} />{ev.catName}</span></td>
              <td>
                <div style={{fontWeight: 600}}>{ev.date}</div>
                <div style={{fontSize: 12, color: "var(--muted)"}}>{ev.time}</div>
              </td>
              <td>{ev.location}</td>
              <td>
                <div className="capacity-bar">
                  <div className="bar"><i className={tone} style={{width: Math.min(100,pct) + "%"}}></i></div>
                  <span>{ev.attended}/{ev.capacity}</span>
                </div>
              </td>
              <td><StatusBadge status={ev.status} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function thumbColor(cat) {
  const m = {
    kajian:   "linear-gradient(135deg, oklch(0.45 0.10 155), oklch(0.30 0.07 155))",
    tahsin:   "linear-gradient(135deg, oklch(0.50 0.09 200), oklch(0.32 0.07 220))",
    tpa:      "linear-gradient(135deg, oklch(0.60 0.10 78), oklch(0.42 0.10 60))",
    zakat:    "linear-gradient(135deg, oklch(0.50 0.10 30), oklch(0.32 0.08 25))",
    muharram: "linear-gradient(135deg, oklch(0.40 0.08 290), oklch(0.28 0.07 280))",
    umum:     "linear-gradient(135deg, oklch(0.50 0.06 145), oklch(0.32 0.05 145))",
  };
  return m[cat] || m.umum;
}

Object.assign(window, { Sidebar, Topbar, Stat, EventCard, StatusBadge, ListView, ListTable, thumbColor });
