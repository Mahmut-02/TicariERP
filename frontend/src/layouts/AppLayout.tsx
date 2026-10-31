import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AppLayout() {
  // Şu an hangi sayfada olduğumu anlamak için React Router'ın useLocation kancasını kullanıyorum.
  // Bu sayede sol menüde aktif olan sayfayı farklı renkte boyayabileceğim.
  const location = useLocation();

  // Menüdeki linklerin tasarımı. Eğer aktif sayfadaysam arka planı hafif aydınlatıp yazıyı beyaz yapıyorum.
  const navItemStyle = (path: string) => ({
    display: 'block',
    padding: '12px 20px',
    color: location.pathname === path ? '#ffffff' : '#94a3b8',
    backgroundColor: location.pathname === path ? '#334155' : 'transparent',
    textDecoration: 'none',
    borderRadius: '6px',
    marginBottom: '8px',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    transition: 'all 0.2s',
    fontSize: '0.95rem'
  });

  return (
    // Tüm ekranı kaplayan, arka planı açık gri (slate-100) olan ana kapsayıcı.
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sol Menü (Sidebar) - Koyu lacivert/gri tonlarında */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '25px', marginTop: 0 }}>
          Ticari<span style={{ color: '#3b82f6' }}>ERP</span>
        </h1>
        <nav>
          <Link to="/" style={navItemStyle('/')}>📦 Ürün Yönetimi</Link>
          <Link to="/cariler" style={navItemStyle('/cariler')}>👥 Cari Hesaplar</Link>
        </nav>
      </div>

      {/* Sağ Taraf - Üst Bar ve Ana İçerik Alanı */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Üst Bar (Header) - Beyaz arka plan ve hafif gölgeli */}
        <header style={{ backgroundColor: '#ffffff', padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
          <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem' }}>
            Şirket: Merkez Şube | Dönem: 2026
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#f1f5f9', padding: '8px 15px', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>
              👤 Muhammed Enes
            </span>
          </div>
        </header>
        
        {/* Değişen Sayfaların Geleceği Ana Alan */}
        <main style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}