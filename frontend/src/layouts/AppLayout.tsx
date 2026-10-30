import { Outlet, Link } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', margin: 0 }}>
      {/* Sol Menü (Sidebar) */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ borderBottom: '1px solid #34495e', paddingBottom: '10px' }}>TicariERP</h2>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
          <li style={{ marginBottom: '15px' }}>
            <Link to="/" style={{ color: '#ecf0f1', textDecoration: 'none' }}>📦 Ürünler</Link>
          </li>
          <li>
            <Link to="/cariler" style={{ color: '#ecf0f1', textDecoration: 'none' }}>👥 Cari Hesaplar</Link>
          </li>
        </ul>
      </div>

      {/* Sağ Ana Bölüm */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Üst Çubuk (Header) */}
        <div style={{ height: '60px', backgroundColor: '#ecf0f1', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #bdc3c7' }}>
          <strong>Şirket: Merkez Şube | Dönem: 2026</strong>
        </div>

        {/* Dinamik Sayfa İçeriği (Outlet) */}
        <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', flex: 1 }}>
          <Outlet /> {/* Tıklanan menünün içeriği buraya gelecek */}
        </div>
      </div>
    </div>
  );
}