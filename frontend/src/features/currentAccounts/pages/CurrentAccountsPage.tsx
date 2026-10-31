import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CurrentAccountsPage() {
  // Backend'den çektiğim cari hesapların listesini bu state içinde tutuyorum.
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // API'den veya kural kitabından (FluentValidation) dönen kırmızı hata mesajlarını burada biriktiriyorum.
  const [errors, setErrors] = useState<string[]>([]);
  
  // Formda düzenleme mi yapıyorum yoksa yeni kayıt mı ekliyorum? Bunu bilmem lazım.
  // Eğer bu değer 'true' ise, form butonu 'Güncelle' olarak değişecek.
  const [isEditing, setIsEditing] = useState(false);
  
  // Form içindeki input alanlarımı bu state'e bağladım.
  // Güncelleme işlemi yapabilmek için 'id' alanını da buraya ekledim. Yeni eklemede 'id' boş kalacak.
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    type: 'Müşteri', // Kullanıcı seçmezse varsayılan olarak Müşteri gitsin.
    taxOffice: '',
    taxNumber: '',
    address: ''
  });

  // Garsona (API'ye) seslenip veritabanımdaki tüm carileri getirmesini istiyorum.
  const fetchAccounts = () => {
    axios.get('http://localhost:5285/api/CurrentAccounts')
      .then(response => setAccounts(response.data))
      .catch(error => console.error("Carileri çekerken sorun yaşadım:", error));
  };

  // Sayfa ilk yüklendiğinde (mount olduğunda) listeyi otomatik çekmesi için useEffect kullanıyorum.
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Formdaki Kaydet / Güncelle butonuna bastığımda burası tetikleniyor.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın anlamsızca yenilenmesini (refresh) engelliyorum ki verilerim uçmasın.
    setErrors([]); // Yeni bir işlem denediğim için ekrandaki eski hataları siliyorum.

    // Eğer 'isEditing' true ise backend'deki Update (PUT) metoduna, false ise Create (POST) metoduna istek atıyorum.
    const apiCall = isEditing 
      ? axios.put('http://localhost:5285/api/CurrentAccounts', formData)
      : axios.post('http://localhost:5285/api/CurrentAccounts', formData);

    apiCall
      .then(() => {
        fetchAccounts(); // İşlem başarılı olduysa ekranı güncellemek için listeyi baştan çekiyorum.
        resetForm(); // İşlem bittiğine göre form alanlarını temizliyorum.
      })
      .catch(err => {
        // Backend'deki kural kitabıma (FluentValidation) takıldıysam hataları yakalayıp ekrana basıyorum.
        if (err.response?.data && Array.isArray(err.response.data)) {
          setErrors(err.response.data.map((x: any) => x.errorMessage));
        } else {
          setErrors(["Sunucuyla iletişim kuramadım. API ayakta mı?"]);
        }
      });
  };

  // Listeden bir kaydı silmek istediğimde burası çalışıyor.
  const handleDelete = (id: string) => {
    if (window.confirm("Bu cari hesabı silmek istediğine emin misin?")) {
      axios.delete(`http://localhost:5285/api/CurrentAccounts/${id}`)
        .then(() => fetchAccounts()) // Sildikten sonra listeyi güncelliyorum.
        .catch(err => console.error("Silme işlemi başarısız:", err));
    }
  };

  // Listeden "Düzenle" butonuna bastığımda o karttaki verileri alıp yukarıdaki forma dolduruyorum.
  const handleEdit = (account: any) => {
    setIsEditing(true); // Artık formun bir güncelleme formu olduğunu sisteme söylüyorum.
    setFormData({
      id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      taxOffice: account.taxOffice || '',
      taxNumber: account.taxNumber || '',
      address: account.address || ''
    });
  };

  // İşi biten veya iptal edilen formu ilk baştaki tertemiz haline döndürüyorum.
  const resetForm = () => {
    setIsEditing(false);
    setFormData({ id: '', code: '', name: '', type: 'Müşteri', taxOffice: '', taxNumber: '', address: '' });
    setErrors([]);
  };

  return (
    <div style={{ color: '#334155' }}>
      <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a' }}>Cari Hesap Yönetimi</h2>
      
      {/* Cari Ekleme / Güncelleme Formu */}
      <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: isEditing ? '#4f46e5' : '#10b981' }}>
          {isEditing ? '✏️ Cari Hesabı Düzenle' : '➕ Yeni Cari Hesap Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Cari Kodu</label>
            <input 
              type="text" required
              value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
              style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div style={{ flex: '2 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Unvan / Ad Soyad</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Tip</label>
            <select 
              value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
              style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}>
              <option value="Müşteri">Müşteri</option>
              <option value="Tedarikçi">Tedarikçi</option>
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Vergi Dairesi</label>
            <input 
              type="text" 
              value={formData.taxOffice} onChange={e => setFormData({...formData, taxOffice: e.target.value})}
              style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Vergi No / TCKN</label>
            <input 
              type="text" 
              value={formData.taxNumber} onChange={e => setFormData({...formData, taxNumber: e.target.value})}
              style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>
          
          <div style={{ width: '100%', display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ padding: '12px 20px', backgroundColor: isEditing ? '#4f46e5' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: 'background-color 0.2s' }}>
              {isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} style={{ padding: '12px 20px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                İptal Et
              </button>
            )}
          </div>
        </form>

        {/* Hata Mesajları Alanı */}
        {errors.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((err, index) => <li key={index}>{err}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Cari Listesi Grid Yapısı */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {accounts.length === 0 ? <p style={{ color: '#64748b' }}>Sistemde henüz kayıtlı cari hesap bulunmuyor.</p> : null}
        
        {accounts.map(account => (
          <div key={account.id} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            
            {/* Kart Üst Bilgi (Müşteri mi Tedarikçi mi çizgisi) */}
            <div style={{ height: '4px', backgroundColor: account.type === 'Müşteri' ? '#3b82f6' : '#f59e0b' }}></div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <strong style={{ fontSize: '1.2rem', color: '#1e293b', wordBreak: 'break-word' }}>{account.name}</strong>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>
                  {account.code}
                </span>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Kayıt Tipi:</span> <strong>{account.type}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vergi Dairesi:</span> <span style={{ color: '#0f172a' }}>{account.taxOffice || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vergi No:</span> <span style={{ color: '#0f172a' }}>{account.taxNumber || '-'}</span>
                </div>
              </div>
            </div>

            {/* Kart Alt Butonları (Düzenle / Sil) */}
            <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
              <button onClick={() => handleEdit(account)} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold', borderRight: '1px solid #f1f5f9' }}>
                Düzenle
              </button>
              <button onClick={() => handleDelete(account.id)} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }}>
                Sil
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}