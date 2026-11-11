import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Giriş yapan kullanıcının bilgilerini tutacağımız alanlar
  const [userName, setUserName] = useState('Kullanıcı');
  const [userInitials, setUserInitials] = useState('U');
  const [photo, setPhoto] = useState<string | null>(null);

  // Sayfa yüklendiğinde Token'ı parçalayıp içindeki ismi ve veritabanından fotoğrafı alıyoruz
  useEffect(() => {
    const fetchPhoto = (currentToken: string) => {
      fetch('http://localhost:5285/api/Profile/get-photo', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.photo) {
          setPhoto(data.photo);
        }
      })
      .catch(err => console.error("Fotoğraf alınamadı:", err));
    };

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // .NET'in token içine gömdüğü isim alanını buluyoruz
        const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Sistem Yöneticisi';
        setUserName(name);
        
        // İsmin baş harflerini alıyoruz (Örn: Mahmut Aslan -> MA)
        const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        setUserInitials(initials);
      } catch (error) {
        console.error("Token okunamadı.");
      }

      // İlk açılışta fotoğrafı çek
      fetchPhoto(token);
    }

    // Ayarlar sayfasından yeni fotoğraf kaydedildiğinde anında güncelle
    const handlePhotoChange = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) fetchPhoto(currentToken);
    };

    window.addEventListener('profilePhotoChanged', handlePhotoChange);
    return () => window.removeEventListener('profilePhotoChanged', handlePhotoChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getNavClass = (path: string) => {
    const isActive = location.pathname === path;
    return `block px-4 py-3 mb-2 rounded-xl transition-all duration-300 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-medium' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`;
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      <div className="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Ticari<span className="text-blue-500">ERP</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium tracking-wider uppercase">Yönetim Paneli</p>
        </div>

        <nav className="flex-1 px-4 mt-6">
          <Link to="/" className={getNavClass('/')}>
            <span className="mr-3 opacity-80">📊</span> Özet
          </Link>
          <Link to="/urunler" className={getNavClass('/urunler')}>
            <span className="mr-3 opacity-80">📦</span> Ürün Yönetimi
          </Link>
          <Link to="/cariler" className={getNavClass('/cariler')}>
            <span className="mr-3 opacity-80">👥</span> Cari Hesaplar
          </Link>
          <Link to="/siparisler" className={getNavClass('/siparisler')}>
            <span className="mr-3 opacity-80">🛒</span> Siparişler
          </Link>
          <Link to="/ayarlar" className={getNavClass('/ayarlar')}>
            <span className="mr-3 opacity-80">⚙️</span> Ayarlar
          </Link>
        </nav>

        {/* DİNAMİK KULLANICI PROFİLİ */}
        <div className="p-4 m-4 bg-slate-800/50 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden shrink-0">
            {photo ? (
              <img src={photo} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">Sistem Yöneticisi</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="px-10 py-6 flex justify-between items-center bg-slate-100/80 backdrop-blur-sm z-10">
          <div className="text-sm font-medium text-slate-500">
            Şirket: Merkez Şube &nbsp;•&nbsp; Dönem: 2026
          </div>
          <button onClick={handleLogout} className="px-5 py-2.5 bg-white text-slate-600 text-sm font-medium rounded-full shadow-sm hover:shadow hover:text-blue-600 transition-all cursor-pointer">
            Oturumu Kapat
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto px-10 pb-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}