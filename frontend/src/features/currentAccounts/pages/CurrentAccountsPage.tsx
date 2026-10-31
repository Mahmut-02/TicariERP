import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CurrentAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  // DTO'muza uygun başlangıç değerleri
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Müşteri', // Varsayılan olarak Müşteri seçili gelsin
    taxOffice: '',
    taxNumber: '',
    address: ''
  });

  const fetchAccounts = () => {
    axios.get('http://localhost:5285/api/CurrentAccounts')
      .then(response => setAccounts(response.data))
      .catch(error => console.error("Veri çekme hatası:", error));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    axios.post('http://localhost:5285/api/CurrentAccounts', formData)
      .then(() => {
        fetchAccounts(); 
        // Formu temizle
        setFormData({ code: '', name: '', type: 'Müşteri', taxOffice: '', taxNumber: '', address: '' });
      })
      .catch(err => {
        if (err.response?.data && Array.isArray(err.response.data)) {
          setErrors(err.response.data.map((x: any) => x.errorMessage));
        } else {
          setErrors(["Beklenmeyen bir hata oluştu. API bağlantısını kontrol edin."]);
        }
      });
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Cari Hesap Yönetimi</h2>
      
      {/* Cari Ekleme Formu */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" placeholder="Cari Kodu (Örn: 120.01)" required
            value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px' }}
          />
          <input 
            type="text" placeholder="Unvan / Ad Soyad" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', flex: 1, minWidth: '200px' }}
          />
          <select 
            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px' }}>
            <option value="Müşteri">Müşteri</option>
            <option value="Tedarikçi">Tedarikçi</option>
          </select>
          <input 
            type="text" placeholder="Vergi Dairesi" 
            value={formData.taxOffice} onChange={e => setFormData({...formData, taxOffice: e.target.value})}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px' }}
          />
          <input 
            type="text" placeholder="Vergi No / TCKN" 
            value={formData.taxNumber} onChange={e => setFormData({...formData, taxNumber: e.target.value})}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px' }}
          />
          
          <button type="submit" style={{ padding: '9px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            Yeni Cari Hesap Ekle
          </button>
        </form>

        {/* Hata Mesajları Alanı */}
        {errors.length > 0 && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((err, index) => <li key={index}>{err}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Cari Listesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {accounts.length === 0 ? <p>Kayıtlı cari hesap bulunamadı...</p> : null}
        {accounts.map(account => (
          <div key={account.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', borderLeft: account.type === 'Müşteri' ? '4px solid #3498db' : '4px solid #e67e22', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong style={{ fontSize: '1.1em' }}>{account.name}</strong>
              <span style={{ fontSize: '0.8em', padding: '3px 8px', backgroundColor: '#ecf0f1', borderRadius: '12px' }}>{account.code}</span>
            </div>
            <div style={{ fontSize: '0.9em', color: '#7f8c8d' }}>
              <p style={{ margin: '5px 0' }}><strong>Tip:</strong> {account.type}</p>
              <p style={{ margin: '5px 0' }}><strong>Vergi Dairesi:</strong> {account.taxOffice || '-'}</p>
              <p style={{ margin: '5px 0' }}><strong>Vergi No:</strong> {account.taxNumber || '-'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}