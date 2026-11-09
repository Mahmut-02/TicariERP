import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchProducts = () => {
    axios.get('http://localhost:5285/api/Products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, price: Number(price), stockQuantity: Number(stockQuantity) };

    if (editId) {
      axios.put(`http://localhost:5285/api/Products/${editId}`, payload)
        .then(() => {
          fetchProducts();
          resetForm();
        });
    } else {
      axios.post('http://localhost:5285/api/Products', payload)
        .then(() => {
          fetchProducts();
          resetForm();
        });
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setName(p.name);
    setPrice(p.price.toString());
    setStockQuantity(p.stockQuantity.toString());
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      axios.delete(`http://localhost:5285/api/Products/${id}`)
        .then(() => fetchProducts());
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setStockQuantity('');
    setEditId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* BAŞLIK */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ürün Yönetimi</h2>
      </div>

      {/* FORM BÖLÜMÜ (Modern, Yumuşatılmış Inputlar) */}
      <div className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-700 mb-4">{editId ? "✏️ Ürünü Güncelle" : "✨ Yeni Ürün Ekle"}</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ürün Adı</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Birim Fiyat (₺)</label>
            <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stok Miktarı</label>
            <input required type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)}
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

      {/* ÜRÜNLER LİSTESİ (Hover Efektli, Sıçrayan Kartlar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col justify-between group">
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stockQuantity < 10 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {product.stockQuantity} Stok
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-700 mb-6">{product.price} ₺</div>
            </div>
            
            <div className="flex gap-2 border-t border-slate-100 pt-4 mt-auto">
              <button onClick={() => handleEdit(product)}
                className="flex-1 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm font-bold rounded-lg transition-colors">
                Düzenle
              </button>
              <button onClick={() => handleDelete(product.id)}
                className="flex-1 py-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-sm font-bold rounded-lg transition-colors">
                Sil
              </button>
            </div>
            
          </div>
        ))}
        
        {products.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400 font-medium">
            Henüz hiç ürün eklenmemiş.
          </div>
        )}
      </div>

    </div>
  );
}