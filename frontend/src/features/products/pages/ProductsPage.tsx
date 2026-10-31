import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', price: '', stockQuantity: '' });

  const fetchProducts = () => {
    axios.get('http://localhost:5285/api/Products')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Veri çekme hatası:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity)
    };

    axios.post('http://localhost:5285/api/Products', payload)
      .then(() => {
        fetchProducts(); 
        setFormData({ name: '', price: '', stockQuantity: '' });
      })
      .catch(err => {
        if (err.response?.data && Array.isArray(err.response.data)) {
          setErrors(err.response.data.map((x: any) => x.errorMessage));
        } else {
          setErrors(["Beklenmeyen bir hata oluştu."]);
        }
      });
  };

  const preventInvalidChars = (e: React.KeyboardEvent) => {
    if (['-', 'e', 'E', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Ürün Yönetimi</h2>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" placeholder="Ürün Adı" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', flex: 1 }}
          />
          <input 
            type="number" placeholder="Fiyat" required min="0" step="0.01"
            value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
            onKeyDown={preventInvalidChars}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', width: '100px' }}
          />
          <input 
            type="number" placeholder="Stok" required min="0"
            value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})}
            onKeyDown={preventInvalidChars}
            style={{ padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', width: '100px' }}
          />
          <button type="submit" style={{ padding: '9px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Ekle
          </button>
        </form>

        {errors.length > 0 && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((err, index) => <li key={index}>{err}</li>)}
            </ul>
          </div>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.length === 0 ? <p>Yükleniyor veya ürün yok...</p> : null}
        {products.map(product => (
          <li key={product.id} style={{ backgroundColor: 'white', padding: '15px', marginBottom: '10px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <strong>{product.name}</strong> <br/>
            <span style={{ color: '#7f8c8d' }}>Fiyat: {product.price} TL | Stok: {product.stockQuantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
