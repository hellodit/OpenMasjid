/* global React, Icons */
const { useState: useS } = React;

/* ============================================================
   PENGATURAN — Settings page
   Two sections: Profil Masjid + Waktu Sholat
   ============================================================ */

function PengaturanView() {
  const [tab, setTab] = useS("profile");
  const [saved, setSaved] = useS(false);

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-header">
          <div className="page-title-block">
            <div className="eyebrow">Sistem</div>
            <h1>Pengaturan</h1>
            <p>Atur identitas masjid dan konfigurasi jadwal sholat yang ditampilkan di TV display serta halaman jamaah.</p>
          </div>
          <div style={{display: "flex", gap: 10, alignItems: "center"}}>
            {saved && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: "var(--green-700)", fontSize: 13, fontWeight: 600
              }}>
                <Icons.Check size={14} /> Tersimpan
              </span>
            )}
            <button className="btn">Batal</button>
            <button className="btn primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2200); }}>
              <Icons.Check size={16} /> Simpan Perubahan
            </button>
          </div>
        </div>

        <div className="settings-tabs">
          <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
            <Icons.Mosque size={16} /> Profil Masjid
          </button>
          <button className={tab === "prayer" ? "active" : ""} onClick={() => setTab("prayer")}>
            <Icons.Clock size={16} /> Waktu Sholat
          </button>
        </div>

        {tab === "profile" && <ProfileMasjid />}
        {tab === "prayer"  && <WaktuSholat />}
      </div>
    </div>
  );
}

/* ============================================================
   Profil Masjid
   ============================================================ */
function ProfileMasjid() {
  const [nama, setNama] = useS("Masjid Al-Hikmah");
  const [arab, setArab] = useS("مَسْجِد الْحِكْمَة");
  const [tahun, setTahun] = useS("1987");
  const [kapasitas, setKapasitas] = useS("850");
  const [tagline, setTagline] = useS("Pusat kegiatan keagamaan dan sosial bagi jamaah di kawasan Bintaro Jaya, Tangerang Selatan.");
  const [alamat, setAlamat] = useS("Jl. Bintaro Utama Sektor 9 Blok B No. 12");
  const [kota, setKota] = useS("Tangerang Selatan");
  const [provinsi, setProvinsi] = useS("Banten");
  const [kodepos, setKodepos] = useS("15229");
  const [phone, setPhone] = useS("+62 21 7351 2200");
  const [email, setEmail] = useS("dkm@alhikmah-bintaro.or.id");
  const [website, setWebsite] = useS("alhikmah-bintaro.or.id");
  const [ig, setIg] = useS("@masjidalhikmah.bintaro");
  const [yt, setYt] = useS("Masjid Al-Hikmah Bintaro");

  return (
    <div className="settings-grid">
      <div>
        <div className="form-section">
          <div className="sec-head">
            <div>
              <h3>Identitas Masjid</h3>
              <p className="sec-desc">Informasi utama yang ditampilkan di header CMS, TV display, dan halaman publik.</p>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Nama Masjid <span className="req">*</span></label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} />
            </div>
            <div className="field">
              <label>Nama dalam Bahasa Arab <span className="hint">opsional</span></label>
              <input type="text" value={arab} onChange={e => setArab(e.target.value)}
                     style={{fontFamily: "serif", direction: "rtl", textAlign: "right"}} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Tahun Berdiri</label>
              <input type="number" value={tahun} onChange={e => setTahun(e.target.value)} />
            </div>
            <div className="field">
              <label>Kapasitas Jamaah</label>
              <input type="number" value={kapasitas} onChange={e => setKapasitas(e.target.value)} />
              <div className="help">Estimasi total kapasitas saat sholat berjamaah.</div>
            </div>
          </div>

          <div className="form-row full">
            <div className="field">
              <label>Deskripsi Singkat</label>
              <textarea value={tagline} onChange={e => setTagline(e.target.value)} rows="3"></textarea>
              <div className="help">Maksimum 240 karakter. Ditampilkan pada halaman tentang dan banner publik.</div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="sec-head">
            <div>
              <h3>Lokasi & Kontak</h3>
              <p className="sec-desc">Alamat lengkap, koordinat geografis, dan kanal kontak DKM.</p>
            </div>
          </div>

          <div className="form-row full">
            <div className="field">
              <label>Alamat</label>
              <input type="text" value={alamat} onChange={e => setAlamat(e.target.value)} />
            </div>
          </div>

          <div className="form-row three">
            <div className="field">
              <label>Kota / Kabupaten</label>
              <input type="text" value={kota} onChange={e => setKota(e.target.value)} />
            </div>
            <div className="field">
              <label>Provinsi</label>
              <input type="text" value={provinsi} onChange={e => setProvinsi(e.target.value)} />
            </div>
            <div className="field">
              <label>Kode Pos</label>
              <input type="text" value={kodepos} onChange={e => setKodepos(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Telepon</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Website</label>
              <input type="text" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            <div className="field">
              <label>Koordinat (Lat, Lng)</label>
              <input type="text" defaultValue="-6.2731, 106.7196" />
              <div className="help">Digunakan untuk perhitungan waktu sholat otomatis.</div>
            </div>
          </div>

          <div className="map-stub">
            <div className="pattern-fade"></div>
            <div className="pin"><Icons.MapPin size={18} /></div>
            <div className="map-meta">
              <div className="t">Bintaro Sektor 9, Tangerang Selatan</div>
              <div className="d">−6.2731° LS, 106.7196° BT · zona waktu WIB (UTC+7)</div>
            </div>
            <button className="btn sm">Sesuaikan di peta</button>
          </div>
        </div>

        <div className="form-section">
          <div className="sec-head">
            <div>
              <h3>Media Sosial</h3>
              <p className="sec-desc">Tautan ditampilkan pada footer halaman publik.</p>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Instagram</label>
              <input type="text" value={ig} onChange={e => setIg(e.target.value)} />
            </div>
            <div className="field">
              <label>YouTube</label>
              <input type="text" value={yt} onChange={e => setYt(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Facebook</label>
              <input type="text" placeholder="https://facebook.com/…" />
            </div>
            <div className="field">
              <label>TikTok</label>
              <input type="text" placeholder="@…" />
            </div>
          </div>
        </div>

      </div>

      <aside>
        <div className="form-section">
          <h3>Logo & Identitas Visual</h3>
          <p className="sec-desc">Diunggah dalam format PNG transparan, minimal 512×512 px.</p>

          <div className="logo-slot">
            <div className="logo-circle">
              <Icons.Star8 size={36} />
            </div>
            <div className="logo-meta">
              <div className="nm">logo-alhikmah.png</div>
              <div className="sub">512×512 · 64 KB</div>
              <div className="acts">
                <button className="btn sm"><Icons.Upload size={12} /> Ganti</button>
                <button className="btn sm danger"><Icons.Trash size={12} /></button>
              </div>
            </div>
          </div>

          <div className="motif-divider">Banner Publik</div>

          <div className="upload-banner">
            <div className="pattern-fade"></div>
            <div className="ico"><Icons.Image size={20} /></div>
            <div className="t">Unggah Banner</div>
            <div className="d">PNG, JPG • 1920×640 • maks 2 MB</div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status Publikasi</h3>
          <p className="sec-desc">Atur visibilitas profil masjid di kanal publik.</p>

          <div className="toggle-row">
            <div>
              <div className="t">Profil publik aktif</div>
              <div className="d">Tampilkan di halaman /masjid</div>
            </div>
            <div className="switch on"><span className="track"></span></div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="t">Tampilkan di TV Display</div>
              <div className="d">Header pada layar utama</div>
            </div>
            <div className="switch on"><span className="track"></span></div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="t">Pendaftaran jamaah baru</div>
              <div className="d">Buka formulir keanggotaan</div>
            </div>
            <div className="switch on"><span className="track"></span></div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="t">Mode pemeliharaan</div>
              <div className="d">Sembunyikan halaman publik</div>
            </div>
            <div className="switch"><span className="track"></span></div>
          </div>
        </div>

        <div className="form-section">
          <h3>Pratinjau Identitas</h3>
          <div className="masjid-preview">
            <div className="pattern-strip"></div>
            <div className="logo"><Icons.Star8 size={26} /></div>
            <div className="nm">{nama}</div>
            <div className="ar">{arab}</div>
            <div className="meta">
              <Icons.MapPin size={11} /> {kota}, {provinsi}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   Waktu Sholat
   ============================================================ */
function WaktuSholat() {
  const [auto, setAuto] = useS(true);
  const [method, setMethod] = useS("kemenag");
  const [tz, setTz] = useS("Asia/Jakarta");
  const [imsak, setImsak] = useS(10);
  const [jumat, setJumat] = useS("12:00");
  const [adj, setAdj] = useS({ subuh: 0, terbit: 0, dzuhur: 2, ashar: 0, maghrib: 0, isya: 0 });
  const [iq, setIq] = useS({ subuh: 15, dzuhur: 10, ashar: 10, maghrib: 5, isya: 10 });

  const prayers = [
    { key: "subuh",   label: "Subuh",   ar: "الفجر",  time: "04:32" },
    { key: "terbit",  label: "Terbit",  ar: "الشروق", time: "05:46", noIq: true },
    { key: "dzuhur",  label: "Dzuhur",  ar: "الظهر",  time: "11:54" },
    { key: "ashar",   label: "Ashar",   ar: "العصر",  time: "15:18" },
    { key: "maghrib", label: "Maghrib", ar: "المغرب", time: "17:51" },
    { key: "isya",    label: "Isya",    ar: "العشاء", time: "19:04" },
  ];

  return (
    <div className="settings-grid">
      <div>
        <div className="form-section">
          <div className="sec-head">
            <div>
              <h3>Metode Perhitungan</h3>
              <p className="sec-desc">Pilih lembaga rujukan dan sumber data untuk waktu sholat otomatis.</p>
            </div>
            <div className="switch on" onClick={() => setAuto(!auto)} style={{cursor: "pointer"}}>
              <span className="track"></span>
              <span className="lbl">Otomatis</span>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Metode</label>
              <select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="kemenag">Kemenag RI</option>
                <option value="mwl">Muslim World League (MWL)</option>
                <option value="isna">ISNA — North America</option>
                <option value="egypt">Egyptian General Authority</option>
                <option value="makkah">Umm Al-Qura, Makkah</option>
                <option value="karachi">University of Islamic Sciences, Karachi</option>
                <option value="custom">Kustom…</option>
              </select>
              <div className="help">Direkomendasikan: Kemenag RI untuk wilayah Indonesia.</div>
            </div>
            <div className="field">
              <label>Mazhab Ashar</label>
              <select defaultValue="syafii">
                <option value="syafii">Syafi'i (bayangan = 1× tinggi)</option>
                <option value="hanafi">Hanafi (bayangan = 2× tinggi)</option>
              </select>
            </div>
          </div>

          <div className="form-row three">
            <div className="field">
              <label>Sudut Fajar</label>
              <div className="suffix-input">
                <input type="number" defaultValue="20" step="0.5" />
                <span>°</span>
              </div>
            </div>
            <div className="field">
              <label>Sudut Isya</label>
              <div className="suffix-input">
                <input type="number" defaultValue="18" step="0.5" />
                <span>°</span>
              </div>
            </div>
            <div className="field">
              <label>Zona Waktu</label>
              <select value={tz} onChange={e => setTz(e.target.value)}>
                <option value="Asia/Jakarta">WIB (UTC+7)</option>
                <option value="Asia/Makassar">WITA (UTC+8)</option>
                <option value="Asia/Jayapura">WIT (UTC+9)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="sec-head">
            <div>
              <h3>Penyesuaian Adzan (Iqamat)</h3>
              <p className="sec-desc">Sesuaikan waktu adzan dan jeda iqamah untuk setiap sholat fardhu.</p>
            </div>
          </div>

          <table className="prayer-table">
            <thead>
              <tr>
                <th style={{width: "26%"}}>Sholat</th>
                <th>Waktu Adzan</th>
                <th>Penyesuaian</th>
                <th>Jeda Iqamah</th>
                <th style={{width: 80, textAlign: "right"}}>Aktif</th>
              </tr>
            </thead>
            <tbody>
              {prayers.map(p => (
                <tr key={p.key}>
                  <td>
                    <div className="pray-cell">
                      <div className="ico"><Icons.Quran size={16} /></div>
                      <div>
                        <div className="nm">{p.label}</div>
                        <div className="ar">{p.ar}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="time-chip">{p.time}</span></td>
                  <td>
                    <div className="stepper">
                      <button onClick={() => setAdj({...adj, [p.key]: (adj[p.key] || 0) - 1})}>−</button>
                      <div className="v">{(adj[p.key] || 0) > 0 ? "+" : ""}{adj[p.key] || 0} mnt</div>
                      <button onClick={() => setAdj({...adj, [p.key]: (adj[p.key] || 0) + 1})}>+</button>
                    </div>
                  </td>
                  <td>
                    {p.noIq ? <span style={{color: "var(--muted)", fontSize: 12}}>—</span> : (
                      <div className="stepper">
                        <button onClick={() => setIq({...iq, [p.key]: Math.max(0, (iq[p.key] || 0) - 1)})}>−</button>
                        <div className="v">{iq[p.key]} mnt</div>
                        <button onClick={() => setIq({...iq, [p.key]: (iq[p.key] || 0) + 1})}>+</button>
                      </div>
                    )}
                  </td>
                  <td style={{textAlign: "right"}}>
                    <div className="switch on" style={{cursor: "pointer"}}><span className="track"></span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-section">
          <div className="sec-head">
            <div>
              <h3>Jum'at & Imsak</h3>
              <p className="sec-desc">Konfigurasi tambahan khusus untuk sholat Jum'at dan jadwal Ramadhan.</p>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Waktu Khutbah Jum'at</label>
              <input type="time" value={jumat} onChange={e => setJumat(e.target.value)} />
              <div className="help">Jeda dari Dzuhur (otomatis: {jumat}).</div>
            </div>
            <div className="field">
              <label>Imsak (sebelum Subuh)</label>
              <div className="suffix-input">
                <input type="number" value={imsak} onChange={e => setImsak(+e.target.value)} />
                <span>menit</span>
              </div>
            </div>
          </div>

          <div className="toggle-row">
            <div>
              <div className="t">Tampilkan Imsak saat Ramadhan</div>
              <div className="d">Otomatis aktif pada bulan Ramadhan menurut kalender hijriyah.</div>
            </div>
            <div className="switch on"><span className="track"></span></div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="t">Tampilkan jadwal Tarawih</div>
              <div className="d">Setelah waktu Isya selama Ramadhan.</div>
            </div>
            <div className="switch on"><span className="track"></span></div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="t">Putar adzan otomatis di TV Display</div>
              <div className="d">Audio diputar 30 detik sebelum waktu adzan.</div>
            </div>
            <div className="switch"><span className="track"></span></div>
          </div>
        </div>

        <div className="form-section">
          <div className="sec-head">
            <div>
              <h3>Tampilan Jadwal</h3>
              <p className="sec-desc">Format jam dan bahasa yang ditampilkan kepada jamaah.</p>
            </div>
          </div>
          <div className="form-row three">
            <div className="field">
              <label>Format Jam</label>
              <select defaultValue="24"><option value="24">24 jam (17:51)</option><option value="12">12 jam (5:51 PM)</option></select>
            </div>
            <div className="field">
              <label>Bahasa Label</label>
              <select defaultValue="id_ar"><option value="id_ar">Indonesia + Arab</option><option value="id">Indonesia saja</option><option value="ar">Arab saja</option></select>
            </div>
            <div className="field">
              <label>Tampilkan Hitung Mundur</label>
              <select defaultValue="next"><option value="next">Ke waktu berikutnya</option><option value="all">Semua waktu</option><option value="none">Tidak ditampilkan</option></select>
            </div>
          </div>
        </div>
      </div>

      <aside>
        <div className="form-section preview-card">
          <h3>Pratinjau TV Display</h3>
          <p className="sec-desc">Tampilan langsung pada layar utama masjid.</p>

          <div className="preview-frame">
            <div className="pattern-strip"></div>
            <div className="pf-head">
              <div className="pf-place">Masjid Al-Hikmah · Bintaro</div>
              <div className="pf-date">Ahad, 17 Mei 2026<br /><span>3 Dzulqa'dah 1447 H</span></div>
            </div>

            <div className="pf-now">
              <div className="lbl">Sekarang · Ashar</div>
              <div className="tm">15:18</div>
              <div className="cd">— 02:14:32 menuju Maghrib</div>
            </div>

            <div className="pf-grid">
              {prayers.filter(p => !p.noIq).map(p => (
                <div key={p.key} className={"pf-cell " + (p.key === "ashar" ? "active" : "")}>
                  <div className="nm">{p.label}</div>
                  <div className="tm">{p.time}</div>
                  {iq[p.key] != null && <div className="iq">iqamah +{iq[p.key]}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Sumber Data</h3>
          <div className="src-row">
            <div className="dot ok"></div>
            <div className="who">
              <div className="t">Sinkronisasi Otomatis</div>
              <div className="d">Diperbarui 12 menit yang lalu dari Kemenag RI · Akurasi koordinat ±50 m.</div>
            </div>
          </div>
          <div className="src-row">
            <div className="dot"></div>
            <div className="who">
              <div className="t">Override Manual</div>
              <div className="d">Tidak ada override manual untuk pekan ini.</div>
            </div>
          </div>
          <button className="btn sm" style={{marginTop: 10, width: "100%", justifyContent: "center"}}>
            <Icons.Download size={13} /> Unduh jadwal sebulan (.csv)
          </button>
        </div>
      </aside>
    </div>
  );
}

Object.assign(window, { PengaturanView });
