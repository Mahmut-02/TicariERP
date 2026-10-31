import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Güncelleme modunda mıyım yoksa yeni ürün mü ekliyorum?
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ id: '', name: '', price: '', stockQuantity: '' });

  const fetchProducts = () => {
    axios.get('http://localhost:5285/api/Products')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Ürünleri çekerken sorun yaşadım:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const payload = {
      id: formData.id,
      name: formData.name,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity)
    };

    const apiCall = isEditing 
      ? axios.put('http://localhost:5285/api/Products', payload)
      : axios.post('http://localhost:5285/api/Products', payload);

    apiCall
      .then(() => {
        fetchProducts(); 
        resetForm();
      })
      .catch(err => {
        if (err.response?.data && Array.isArray(err.response.data)) {
          setErrors(err.response.data.map((x: any) => x.errorMessage));
        } else {
          setErrors(["Sunucuyla iletişim kuramadım. API ayakta mı?"]);
        }
      });
  };

  // Ürün silme işlemim
  const handleDelete = (id: string) => {
    if (window.confirm("Bu ürünü silmek istediğine emin misin?")) {
      axios.delete(`http://localhost:5285/api/Products/${id}`)
        .then(() => fetchProducts())
        .catch(err => console.error("Silme işlemi başarısız:", err));
    }
  };

  // Düzenle butonuna basınca karttaki veriyi forma taşıyorum
  const handleEdit = (product: any) => {
    setIsEditing(true);
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString()
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({ id: '', name: '', price: '', stockQuantity: '' });
    setErrors([]);
  };

  const preventInvalidChars = (e: React.KeyboardEvent) => {
    if (['-', 'e', 'E', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div style={{ color: '#334155' }}>
      <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a' }}>Ürün Yönetimi</h2>
      
      {/* Ürün Ekleme / Güncelleme Formu */}
      <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: isEditing ? '#4f46e5' : '#10b981' }}>
          {isEditing ? '✏️ Ürünü Düzenle' : '➕ Yeni Ürün Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Ürün Adı</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Birim Fiyat (TL)</label>
            <input 
              type="number" required min="0" step="0.01"
              value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
              onKeyDown={preventInvalidChars}
              style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Stok Miktarı</label>
            <input 
              type="number" required min="0"
              value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})}
              onKeyDown={preventInvalidChars}
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

        {/* Hata Mesajları */}
        {errors.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((err, index) => <li key={index}>{err}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Ürün Listesi Grid Yapısı */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {products.length === 0 ? <p style={{ color: '#64748b' }}>Sistemde henüz kayıtlı ürün bulunmuyor.</p> : null}
        
        {products.map(product => (
          <div key={product.id} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ height: '4px', backgroundColor: '#8b5cf6' }}></div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <strong style={{ fontSize: '1.2rem', color: '#1e293b', wordBreak: 'break-word' }}>{product.name}</strong>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fiyat:</span> <strong style={{ color: '#0f172a' }}>{product.price} ₺</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Stok:</span> <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{product.stockQuantity} Adet</span>
                </div>
              </div>
            </div>

            {/* Düzenle / Sil Butonları */}
            <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
              <button onClick={() => handleEdit(product)} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold', borderRight: '1px solid #f1f5f9' }}>
                Düzenle
              </button>
              <button onClick={() => handleDelete(product.id)} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }}>
                Sil
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}