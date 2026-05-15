/* global React, Icons, CATEGORIES, EVENTS, ATTENDEES, SCHEDULE, StatusBadge */
const { useState } = React;

/* ============================================================
   Add Event Form
   ============================================================ */
function AddView({ setRoute }) {
  const [cat, setCat] = useState("kajian");
  const [tags, setTags] = useState(["pekanan", "tafsir"]);
  const [tagDraft, setTagDraft] = useState("");
  const [pubNow, setPubNow] = useState(true);
  const [needsReg, setNeedsReg] = useState(true);
  const [livestream, setLivestream] = useState(false);

  const addTag = (e) => {
    if (e.key === "Enter" && tagDraft.trim()) {
      e.preventDefault();
      setTags([...tags, tagDraft.trim()]);
      setTagDraft("");
    }
  };

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-header">
          <div className="page-title-block">
            <div className="eyebrow">Kegiatan Baru</div>
            <h1>Tambah Kegiatan</h1>
            <p>Lengkapi informasi kegiatan agar jamaah dapat mengetahui dan mendaftar dengan mudah.</p>
          </div>
          <button className="btn ghost" onClick={() => setRoute("list")}>
            <Icons.ArrowLeft size={16} /> Kembali ke Daftar
          </button>
        </div>

        <div className="form-grid">
          <div className="sidebar-card">
            <div className="form-section" style={{margin: 0}}>
              <h4>Langkah Pengisian</h4>
              <p>Ikuti urutan ini agar kegiatan tampil rapi pada portal jamaah.</p>
              <div className="step done">
                <div className="n">1</div>
                <div><div className="t">Informasi Dasar</div><div className="d">Judul, kategori, deskripsi</div></div>
              </div>
              <div className="step done">
                <div className="n">2</div>
                <div><div className="t">Jadwal & Lokasi</div><div className="d">Waktu, tempat, susunan acara</div></div>
              </div>
              <div className="step">
                <div className="n">3</div>
                <div><div className="t">Pembicara</div><div className="d">Ustadz / Narasumber</div></div>
              </div>
              <div className="step">
                <div className="n">4</div>
                <div><div className="t">Banner & Visual</div><div className="d">Poster kegiatan</div></div>
              </div>
              <div className="step">
                <div className="n">5</div>
                <div><div className="t">Pengaturan</div><div className="d">Pendaftaran & publikasi</div></div>
              </div>
            </div>
          </div>

          <div>
            {/* Section 1: Basic */}
            <section className="form-section">
              <h3>Informasi Dasar</h3>
              <p className="sec-desc">Tampilkan kegiatan secara jelas. Judul yang baik singkat namun deskriptif.</p>

              <div className="form-row full">
                <div className="field">
                  <label>Judul Kegiatan <span className="req">*</span></label>
                  <input type="text" defaultValue="Kajian Tafsir Surah Yasin" />
                </div>
              </div>

              <div className="form-row full">
                <div className="field">
                  <label>Kategori <span className="req">*</span></label>
                  <div className="cat-grid">
                    {CATEGORIES.map(c => (
                      <div key={c.id}
                           className={"cat-pick " + (cat===c.id ? "sel" : "")}
                           onClick={() => setCat(c.id)}>
                        <div className="ico" style={{background: thumbColor(c.id)}}><c.Icon size={18} /></div>
                        <div className="nm">{c.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row full">
                <div className="field">
                  <label>Deskripsi <span className="hint">Markdown didukung</span></label>
                  <textarea defaultValue="Kajian rutin pekanan setiap hari Selasa selepas Maghrib. Bahasan kali ini melanjutkan tafsir Surah Yasin ayat 30-40 dari kitab Tafsir Ibn Katsir. Terbuka untuk seluruh jamaah ikhwan dan akhwat."></textarea>
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Tag <span className="hint">Tekan Enter untuk menambah</span></label>
                  <div className="tag-input">
                    {tags.map((t, i) => (
                      <span key={i} className="tag-pill">
                        #{t}
                        <button onClick={() => setTags(tags.filter((_, j) => j !== i))}>
                          <Icons.X size={12} />
                        </button>
                      </span>
                    ))}
                    <input value={tagDraft} onChange={e => setTagDraft(e.target.value)}
                           onKeyDown={addTag} placeholder="Tambah tag…" />
                  </div>
                </div>
                <div className="field">
                  <label>Bahasa Pengantar</label>
                  <select defaultValue="id">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="ar">Bahasa Arab</option>
                    <option value="en">English</option>
                    <option value="mix">Campuran (ID + Arab)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 2: Schedule */}
            <section className="form-section">
              <h3>Jadwal & Lokasi</h3>
              <p className="sec-desc">Tentukan kapan dan dimana kegiatan akan diselenggarakan.</p>

              <div className="form-row">
                <div className="field">
                  <label>Tanggal Mulai <span className="req">*</span></label>
                  <input type="date" defaultValue="2026-05-12" />
                </div>
                <div className="field">
                  <label>Tanggal Selesai</label>
                  <input type="date" defaultValue="2026-05-12" />
                </div>
              </div>

              <div className="form-row three">
                <div className="field">
                  <label>Waktu Mulai <span className="req">*</span></label>
                  <input type="time" defaultValue="19:30" />
                </div>
                <div className="field">
                  <label>Waktu Selesai</label>
                  <input type="time" defaultValue="21:00" />
                </div>
                <div className="field">
                  <label>Patokan Waktu</label>
                  <select defaultValue="maghrib">
                    <option value="fix">Waktu Tetap</option>
                    <option value="subuh">Ba'da Subuh</option>
                    <option value="dhuhur">Ba'da Dzuhur</option>
                    <option value="ashar">Ba'da Ashar</option>
                    <option value="maghrib">Ba'da Maghrib</option>
                    <option value="isya">Ba'da Isya</option>
                  </select>
                </div>
              </div>

              <div className="motif-divider">Lokasi</div>

              <div className="form-row">
                <div className="field">
                  <label>Tempat <span className="req">*</span></label>
                  <input type="text" defaultValue="Ruang Utama Masjid" />
                </div>
                <div className="field">
                  <label>Detail Lokasi</label>
                  <input type="text" defaultValue="Lt. 1, Mihrab Selatan" />
                </div>
              </div>

              <div className="form-row full">
                <div className="field">
                  <label>Alamat Lengkap</label>
                  <input type="text" defaultValue="Jl. KH. Hasyim Asy'ari No. 14, Kelurahan Sukamaju" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Kapasitas Maksimum</label>
                  <input type="number" defaultValue="200" />
                </div>
                <div className="field">
                  <label>Pengulangan</label>
                  <select>
                    <option>Tidak Berulang</option>
                    <option>Setiap Hari</option>
                    <option>Setiap Pekan</option>
                    <option>Setiap Bulan</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 3: Speaker */}
            <section className="form-section">
              <h3>Pembicara / Narasumber</h3>
              <p className="sec-desc">Lampirkan nama dan profil singkat ustadz atau narasumber.</p>

              <div className="form-row">
                <div className="field">
                  <label>Nama Pembicara <span className="req">*</span></label>
                  <input type="text" defaultValue="Ust. Ahmad Mahfudz, Lc." />
                </div>
                <div className="field">
                  <label>Jabatan / Asal</label>
                  <input type="text" defaultValue="Imam Tetap Masjid Al-Hikmah" />
                </div>
              </div>

              <div className="form-row full">
                <div className="field">
                  <label>Biografi Singkat</label>
                  <textarea defaultValue="Lulusan Universitas Islam Madinah jurusan Syari'ah. Aktif mengisi kajian rutin di Masjid Al-Hikmah sejak 2018."></textarea>
                </div>
              </div>
            </section>

            {/* Section 4: Banner */}
            <section className="form-section">
              <h3>Banner Kegiatan</h3>
              <p className="sec-desc">Banner ditampilkan pada halaman kegiatan dan portal jamaah. Rekomendasi 1600×900px.</p>
              <div className="upload-banner">
                <div className="pattern-fade" style={{position: "absolute", inset: 0}}></div>
                <div className="ico"><Icons.Upload size={20} /></div>
                <div className="t">Tarik & lepas berkas, atau <span style={{color: "var(--green-700)", textDecoration: "underline"}}>pilih dari komputer</span></div>
                <div className="d">PNG · JPG · WEBP — Maksimal 4MB</div>
              </div>
            </section>

            {/* Section 5: Settings */}
            <section className="form-section">
              <h3>Pengaturan & Publikasi</h3>
              <p className="sec-desc">Atur pendaftaran, visibilitas, dan saluran tampilan kegiatan.</p>

              <div style={{display: "grid", gap: 12}}>
                <Toggle on={pubNow} setOn={setPubNow}
                        title="Tayangkan Sekarang"
                        desc="Bila aktif, kegiatan langsung muncul di portal jamaah." />
                <Toggle on={needsReg} setOn={setNeedsReg}
                        title="Memerlukan Pendaftaran"
                        desc="Jamaah perlu mendaftar terlebih dahulu untuk hadir." />
                <Toggle on={livestream} setOn={setLivestream}
                        title="Live Streaming"
                        desc="Sediakan tautan siaran langsung saat kegiatan berlangsung." />
              </div>
            </section>

            <div className="action-bar">
              <button className="btn ghost" onClick={() => setRoute("list")}>Batalkan</button>
              <div style={{display: "flex", gap: 10}}>
                <button className="btn">Simpan sebagai Draf</button>
                <button className="btn primary"><Icons.Check size={16} /> Publikasikan Kegiatan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, setOn, title, desc }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 16px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      background: on ? "var(--green-50)" : "var(--surface)",
      borderColor: on ? "oklch(0.85 0.05 155)" : "var(--border)",
      transition: "background 120ms, border 120ms"
    }}>
      <div>
        <div style={{fontWeight: 600, fontSize: 14}}>{title}</div>
        <div style={{color: "var(--muted)", fontSize: 12, marginTop: 2}}>{desc}</div>
      </div>
      <button className={"switch " + (on ? "on" : "")} onClick={() => setOn(!on)}>
        <span className="track"></span>
      </button>
    </div>
  );
}

/* ============================================================
   Detail View
   ============================================================ */
function DetailView({ id, setRoute }) {
  const ev = EVENTS.find(e => e.id === id) || EVENTS[0];
  const cat = CATEGORIES.find(c => c.id === ev.cat);
  const pct = Math.round((ev.attended / ev.capacity) * 100);

  return (
    <div className="page">
      <div className="page-narrow">
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18}}>
          <button className="btn ghost" onClick={() => setRoute("list")}>
            <Icons.ArrowLeft size={16} /> Kembali ke Daftar
          </button>
          <div style={{display: "flex", gap: 8}}>
            <button className="btn"><Icons.Share size={16} /> Bagikan</button>
            <button className="btn"><Icons.Edit size={16} /> Edit</button>
            <button className="btn danger"><Icons.Trash size={16} /> Hapus</button>
          </div>
        </div>

        <div className="detail-hero" style={{background: thumbColor(ev.cat)}}>
          <div className="pattern-strip"></div>
          <div className="cat-tag"><cat.Icon size={12} />{ev.catName}</div>
          <div className="ar-quote" style={{fontFamily: "serif"}}>{ev.arabic}</div>
          <h1>{ev.title}</h1>
          <div style={{opacity: 0.85, maxWidth: 640, marginTop: 4}}>{ev.day}, {ev.date} • {ev.time}</div>
          <div className="speaker-row">
            <div className="av">{ev.speaker.split(" ").slice(-1)[0].charAt(0)}</div>
            <div>
              <div className="nm">{ev.speaker}</div>
              <div className="rl">{ev.role}</div>
            </div>
            <div style={{marginLeft: "auto"}}>
              <StatusBadge status={ev.status} />
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <div className="info-box">
              <h3>Tentang Kegiatan</h3>
              <p className="lead">{ev.desc}</p>

              <div className="motif-divider">Detail</div>

              <div className="info-grid">
                <div className="info-cell">
                  <div className="ico"><Icons.Calendar size={18} /></div>
                  <div><div className="lbl">Tanggal</div><div className="val">{ev.day}, {ev.date}</div><div className="sub">{ev.time}</div></div>
                </div>
                <div className="info-cell">
                  <div className="ico"><Icons.MapPin size={18} /></div>
                  <div><div className="lbl">Lokasi</div><div className="val">{ev.location}</div><div className="sub">{ev.address}</div></div>
                </div>
                <div className="info-cell">
                  <div className="ico"><Icons.Users size={18} /></div>
                  <div><div className="lbl">Kapasitas</div><div className="val">{ev.attended} dari {ev.capacity} orang</div><div className="sub">{pct}% terisi</div></div>
                </div>
                <div className="info-cell">
                  <div className="ico"><Icons.Mic size={18} /></div>
                  <div><div className="lbl">Pembicara</div><div className="val">{ev.speaker}</div><div className="sub">{ev.role}</div></div>
                </div>
              </div>
            </div>

            <div className="info-box">
              <h3>Susunan Acara</h3>
              <ul className="schedule">
                {SCHEDULE.map((s, i) => (
                  <li key={i}>
                    <div className="time">{s.time}</div>
                    <div>
                      <div className="what">{s.what}</div>
                      <div className="who">{s.who}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="info-box">
              <h3>Catatan untuk Jamaah</h3>
              <ul style={{margin: 0, paddingLeft: 18, lineHeight: 1.85, color: "var(--ink-2)"}}>
                <li>Mohon hadir 10 menit sebelum acara dimulai.</li>
                <li>Membawa mushaf atau perangkat yang berisi mushaf digital.</li>
                <li>Disediakan ruang terpisah untuk jamaah ikhwan dan akhwat.</li>
                <li>Tersedia konsumsi ringan setelah sesi tanya jawab.</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="side-card">
              <h4>Kapasitas <span style={{fontSize: 11, color: "var(--muted)", fontWeight: 500}}>{pct}% terisi</span></h4>
              <div className="cap-big">{ev.attended}<span className="of"> / {ev.capacity}</span></div>
              <div className="cap-meter"><i style={{width: Math.min(100, pct) + "%"}}></i></div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "var(--muted)"}}>
                <div>Sisa kursi <strong style={{color: "var(--ink)"}}>{Math.max(0, ev.capacity - ev.attended)}</strong></div>
                <div>Daftar tunggu <strong style={{color: "var(--ink)"}}>0</strong></div>
              </div>
            </div>

            <div className="side-card">
              <h4>Pendaftar Terbaru
                <button className="btn sm ghost" style={{padding: 0}}>Lihat semua</button>
              </h4>
              {ATTENDEES.map((a, i) => (
                <div className="attendee" key={i}>
                  <div className="av">{a.name.split(" ").map(n => n[0]).slice(0,2).join("")}</div>
                  <div>
                    <div className="nm">{a.name}</div>
                    <div className="em">{a.email}</div>
                  </div>
                  <div className="when">{a.when}</div>
                </div>
              ))}
            </div>

            <div className="side-card">
              <h4>Kontak Penyelenggara</h4>
              <div style={{display: "flex", flexDirection: "column", gap: 10}}>
                <div style={{display: "flex", alignItems: "center", gap: 10}}>
                  <div className="info-cell" style={{padding: 0, border: "none", background: "transparent"}}>
                    <div className="ico" style={{margin: 0}}><Icons.Phone size={16} /></div>
                  </div>
                  <div>
                    <div style={{fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600}}>Telepon</div>
                    <div style={{fontWeight: 600}}>+62 812-3456-7890</div>
                  </div>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 10}}>
                  <div className="info-cell" style={{padding: 0, border: "none", background: "transparent"}}>
                    <div className="ico" style={{margin: 0}}><Icons.Mail size={16} /></div>
                  </div>
                  <div>
                    <div style={{fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600}}>Email</div>
                    <div style={{fontWeight: 600}}>dkm@masjidku.id</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddView, DetailView, Toggle });
