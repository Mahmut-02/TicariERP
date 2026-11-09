import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CurrentAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [address, setAddress] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchAccounts = () => {
    axios.get('http://localhost:5285/api/CurrentAccounts')
      .then(res => setAccounts(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, taxNumber, address };

    if (editId) {
      axios.put(`http://localhost:5285/api/CurrentAccounts/${editId}`, payload)
        .then(() => {
          fetchAccounts();
          resetForm();
        });
    } else {
      axios.post('http://localhost:5285/api/CurrentAccounts', payload)
        .then(() => {
          fetchAccounts();
          resetForm();
        });
    }
  };

  const handleEdit = (acc: any) => {
    setEditId(acc.id);
    setName(acc.name);
    setTaxNumber(acc.taxNumber);
    setAddress(acc.address || '');
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Bu cari hesabı silmek istediğinize emin misiniz? (Bağlı siparişler varsa hata verebilir)")) {
      axios.delete(`http://localhost:5285/api/CurrentAccounts/${id}`)
        .then(() => fetchAccounts())
        .catch(err => alert("Silme başarısız: " + (err.response?.data?.message || err.message)));
    }
  };

  const resetForm = () => {
    setName('');
    setTaxNumber('');
    setAddress('');
    setEditId(null);
  };

  // Ortak Hover ve Gölge Efektimiz
  const cardClasses = "bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col group";

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* BAŞLIK */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cari Hesaplar (Müşteriler)</h2>
      </div>

      {/* FORM BÖLÜMÜ */}
      <div className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-700 mb-4">{editId ? "✏️ Cari Hesabı Güncelle" : "✨ Yeni Cari Hesap Ekle"}</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Firma / Kişi Adı</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">VKN / TCKN</label>
            <input required type="text" value={taxNumber} onChange={e => setTaxNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Açık Adres (Opsiyonel)</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" />
          </div>
          
          <div className="w-full md:w-auto flex gap-2">
            <button type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 w-full md:w-auto">
              {editId ? "Güncelle" : "Kaydet"}
            </button>
            
            {editId && (
              <button type="button" onClick={resetForm}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all duration-300">
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* MÜŞTERİ KARTLARI LİSTESİ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className={cardClasses}>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {acc.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1" title={acc.name}>{acc.name}</h4>
                  <div className="text-xs font-bold text-slate-400">VKN/TCKN: <span className="text-slate-600">{acc.taxNumber}</span></div>
                </div>
              </div>
              
              <div className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-2" title={acc.address || 'Adres bilgisi yok'}>
                📍 {acc.address || 'Adres girilmemiş.'}
              </div>
            </div>
            
            <div className="flex gap-2 border-t border-slate-100 pt-4 mt-auto">
              <button onClick={() => handleEdit(acc)}
                className="flex-1 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm font-bold rounded-lg transition-colors">
                Düzenle
              </button>
              <button onClick={() => handleDelete(acc.id)}
                className="flex-1 py-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-sm font-bold rounded-lg transition-colors">
                Sil
              </button>
            </div>
            
          </div>
        ))}
        
        {accounts.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400 font-medium">
            Henüz hiç cari hesap eklenmemiş.
          </div>
        )}
      </div>

    </div>
  );
}