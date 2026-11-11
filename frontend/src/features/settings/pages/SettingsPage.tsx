import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// --- KESME (CROP) İŞLEMİ İÇİN YARDIMCI FONKSİYONLAR ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas context oluşturulamadı');

  // Veritabanını ve API'yi yormamak için avatarı 300x300 boyutuna sabitliyoruz
  canvas.width = 300;
  canvas.height = 300;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    300,
    300
  );

  return canvas.toDataURL('image/jpeg', 0.8);
}

export default function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // --- FOTOĞRAF VE KIRPMA STATE'LERİ ---
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Token'dan Kesin Bilgileri Çek
    const rawToken = localStorage.getItem('token');
    if (rawToken) {
      const token = rawToken.replace(/"/g, ''); 
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Konsoldaki röntgene göre isim ve e-posta çekimi:
        const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        if (name) setUserName(name);
        
        const userEmail = payload['email'];
        if (userEmail) setEmail(userEmail);
        
      } catch (error) {
        console.error("Token parçalanamadı.");
      }
    }

    // 2. Fotoğrafı Çek
    const fetchPhoto = async () => {
      try {
        const rawToken = localStorage.getItem('token');
        const token = rawToken ? rawToken.replace(/"/g, '') : '';
        
        const response = await fetch('http://localhost:5285/api/Profile/get-photo', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.photo) {
            setProfileImage(data.photo); 
          }
        }
      } catch (error) {
        console.error("Fotoğraf yüklenemedi");
      }
    };

    fetchPhoto();
  }, []);
  // --- SÜRÜKLE BIRAK (DRAG & DROP) İŞLEMLERİ ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // --- DOSYA SEÇİMİ VE İŞLEME ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageToCrop(reader.result as string); // Kırpma ekranını açar
    };
  };

  // --- KIRPMA (CROP) İŞLEMLERİ ---
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (imageToCrop && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setPhotoPreview(croppedImage); 
        setImageToCrop(null); 

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5285/api/Profile/upload-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ photo: croppedImage })
        });

        if (response.ok) {
          window.dispatchEvent(new Event('profilePhotoChanged'));
          alert("Profil fotoğrafınız veritabanına başarıyla kaydedildi!");
        } else {
          // GERÇEK HATAYI YAKALAYIP GÖSTERELİM
          const errorText = await response.text();
          alert(`Sunucu Hatası (Kod: ${response.status}): ${errorText}`);
        }
      }
    } catch (e: any) {
      alert(`Bağlantı Hatası (Backend'e ulaşılamadı): ${e.message}`);
    }
  };

  // KİŞİSEL BİLGİLERİ GÜNCELLEME İŞLEMİ
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    try {
      const rawToken = localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/"/g, '') : '';

      const response = await fetch('http://localhost:5285/api/Profile/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: userName, 
          email: email 
        })
      });

      if (response.ok) {
        alert("Bilgileriniz başarıyla güncellendi! (Değişikliklerin navbarda yansıması için yeniden giriş yapmanız gerekebilir)");
      } else {
        alert("Bilgiler güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      alert("Bağlantı hatası!");
    }
  };

  
  
 

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'A';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium";
  const labelClasses = "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10 relative">
      
      {/* --- KIRPMA (CROP) MODALI --- */}
      {imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Fotoğrafı Kırp</h3>
              <button onClick={() => setImageToCrop(null)} className="text-slate-400 hover:text-rose-500 text-xl font-bold">&times;</button>
            </div>
            
            <div className="relative w-full h-80 bg-slate-100">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 bg-white space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Yakınlaştır</label>
                <input 
                  type="range" min={1} max={3} step={0.1} value={zoom} 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className="w-full mt-2 accent-blue-600"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setImageToCrop(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">İptal</button>
                <button onClick={handleCropSave} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Hesap Ayarları</h2>
        <p className="text-sm text-slate-500 mt-1">Kişisel bilgilerinizi ve güvenlik ayarlarınızı buradan yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL PANEL: PROFİL KARTI */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group">
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative"></div>

            <div className="px-6 pb-8 relative flex flex-col items-center text-center -mt-16">
              
              {/* SÜRÜKLE BIRAK ALANI */}
              <div 
                className={`relative group/avatar mb-4 rounded-full transition-all duration-300 ${isDragging ? 'ring-4 ring-blue-500 scale-105' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg relative z-10">
                  {photoPreview || profileImage ? (
                    <img src={photoPreview|| profileImage || ''} alt="Profil" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-4xl shadow-inner">
                      {getInitials(userName)}
                    </div>
                  )}
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`absolute inset-1.5 rounded-full bg-black/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm ${isDragging ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'}`}
                  >
                    <span className="text-2xl mb-1">{isDragging ? '📥' : '📷'}</span>
                    <span className="text-white text-xs font-medium text-center px-2">
                      {isDragging ? 'Buraya Bırak' : 'Değiştir (Sürükleyebilirsin)'}
                    </span>
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <h3 className="text-xl font-bold text-slate-800">{userName}</h3>
              <p className="text-sm font-medium text-slate-500 mb-4">Sistem Yöneticisi</p>
              
              <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Hesap Durumu: Aktif
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: FORMLAR */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">👤 Kişisel Bilgiler</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Ad Soyad</label>
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                  <label className={labelClasses}>E-Posta Adresi</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}