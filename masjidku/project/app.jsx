/* global React, ReactDOM, Sidebar, Topbar, ListView, AddView, DetailView, DashboardView, KategoriView, PendaftarView, PengaturanView, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakSelect, Icons */
const { useState, useEffect } = React;

const TWEAK_DEFAULS = /*EDITMODE-BEGIN*/{
  "primary": "#1f6b4a",
  "accent": "#c89a3e",
  "density": "comfortable",
  "headlineFont": "Lora",
  "showPattern": true,
  "view": "pengaturan"
}/*EDITMODE-END*/;

function App() {
  const [route, setRoute] = useState("list");
  const [detailId, setDetailId] = useState("ev-001");
  const [t, setTweak] = useTweaks(TWEAK_DEFAULS);

  // Sync route with tweak
  useEffect(() => {
    if (t.view && t.view !== route && ["dashboard", "list", "add", "detail", "kategori", "pendaftar", "pengaturan"].includes(t.view)) {
      setRoute(t.view);
    }
    // eslint-disable-next-line
  }, [t.view]);

  // Apply tweak vars
  useEffect(() => {
    const r = document.documentElement;
    if (t.primary) {
      // map hex roughly back to oklch via CSS native? Use a CSS variable override
      r.style.setProperty("--green-700", t.primary);
    }
    if (t.accent) {
      r.style.setProperty("--gold", t.accent);
    }
    r.style.setProperty("--font-serif", `"${t.headlineFont || "Lora"}", Georgia, serif`);
  }, [t.primary, t.accent, t.headlineFont]);

  const openDetail = (id) => { setDetailId(id); setRoute("detail"); setTweak("view", "detail"); };

  const crumbs = route === "dashboard" ? ["Manajemen", "Dashboard"]
              : route === "list"      ? ["Manajemen", "Kegiatan"]
              : route === "add"       ? ["Manajemen", "Kegiatan", "Tambah"]
              : route === "kategori"  ? ["Manajemen", "Kategori"]
              : route === "pendaftar" ? ["Manajemen", "Pendaftar"]
              : route === "pengaturan" ? ["Sistem", "Pengaturan"]
              : ["Manajemen", "Kegiatan", "Detail"];

  return (
    <div className="app">
      <Sidebar route={route} setRoute={(r) => { setRoute(r); setTweak("view", r); }} />
      <main className="main">
        <Topbar crumbs={crumbs} />
        {route === "dashboard" && <DashboardView openDetail={openDetail} setRoute={(r) => { setRoute(r); setTweak("view", r); }} />}
        {route === "list" && <ListView setRoute={(r) => { setRoute(r); setTweak("view", r); }} openDetail={openDetail} />}
        {route === "add"  && <AddView  setRoute={(r) => { setRoute(r); setTweak("view", r); }} />}
        {route === "detail" && <DetailView id={detailId} setRoute={(r) => { setRoute(r); setTweak("view", r); }} />}
        {route === "kategori" && <KategoriView />}
        {route === "pendaftar" && <PendaftarView />}
        {route === "pengaturan" && <PengaturanView />}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Navigasi">
          <TweakSelect label="Tampilan saat ini" value={t.view}
            onChange={v => { setTweak("view", v); setRoute(v); }}
            options={[
              {value: "dashboard", label: "Dashboard"},
              {value: "list", label: "Daftar Kegiatan"},
              {value: "add", label: "Tambah Kegiatan"},
              {value: "detail", label: "Detail Kegiatan"},
              {value: "kategori", label: "Kategori"},
              {value: "pendaftar", label: "Pendaftar"},
              {value: "pengaturan", label: "Pengaturan"},
            ]} />
        </TweakSection>
        <TweakSection title="Warna">
          <TweakColor label="Warna primer (hijau)" value={t.primary}
            onChange={v => setTweak("primary", v)}
            options={["#1f6b4a", "#0f5132", "#2a8d6a", "#15522e", "#3a8a5a"]} />
          <TweakColor label="Warna aksen (emas)" value={t.accent}
            onChange={v => setTweak("accent", v)}
            options={["#c89a3e", "#b3823a", "#d4af37", "#a36b2b"]} />
        </TweakSection>
        <TweakSection title="Tipografi">
          <TweakSelect label="Font Headline" value={t.headlineFont}
            onChange={v => setTweak("headlineFont", v)}
            options={[
              {value: "Lora", label: "Lora (serif)"},
              {value: "Plus Jakarta Sans", label: "Plus Jakarta Sans"},
              {value: "Cormorant Garamond", label: "Cormorant"},
              {value: "Amiri", label: "Amiri (Arabic-flavored)"},
            ]} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
