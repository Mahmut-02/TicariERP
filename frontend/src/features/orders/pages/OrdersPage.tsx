import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrdersPage() {
  // Veritabanımdan çekeceğim ana listeleri bu state'lerde tutuyorum.
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Hataları ekrana basmak için
  const [errors, setErrors] = useState<string[]>([]);
  
  // Sipariş Başlık Bilgileri
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]); // Bugünün tarihi yyyy-MM-dd formatında

  // Sepete ürün eklemek için kullanacağım geçici alanlar
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  
  // Faturanın alt kalemleri (Kullanıcının sepete attığı ürünler)
  const [cart, setCart] = useState<any[]>([]);

  // Sayfa yüklendiğinde Siparişleri, Ürünleri ve Carileri (Müşterileri) aynı anda çekiyorum.
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // Promise.all kullanarak 3 farklı API isteğini paralel olarak, bekletmeden atıyorum.
    Promise.all([
      axios.get('http://localhost:5285/api/Orders'),
      axios.get('http://localhost:5285/api/Products'),
      axios.get('http://localhost:5285/api/CurrentAccounts')
    ]).then(([ordersRes, productsRes, accountsRes]) => {
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      // Sadece Müşteri tipindeki carileri filtreleyip dropdown'a koyuyorum (Tedarikçiye satış yapılmaz)
        setAccounts(accountsRes.data); // Tüm cariler listede görünecek
    }).catch(err => console.error("Verileri çekerken hata oluştu:", err));
  };

  // Sepete yeni bir ürün kalemi ekleme işlemi
  const handleAddToCart = () => {
    setErrors([]);
    if (!selectedProductId || !quantity || quantity <= 0) {
      setErrors(["Lütfen bir ürün seçin ve geçerli bir miktar girin."]);
      return;
    }

    // Seçilen ürünün tüm detaylarını products listesinden buluyorum (Fiyatını ve adını almak için)
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Arayüzde basit bir stok kontrolü yapıyorum (Backend de yapacak ama kullanıcıyı yormadan önce burada da uyaralım)
    if (product.stockQuantity < quantity) {
      setErrors([`Stok yetersiz! '${product.name}' ürününden elimizde sadece ${product.stockQuantity} adet var.`]);
      return;
    }

    // Ürünü sepet (cart) state'ime ekliyorum
    const cartItem = {
      productId: product.id,
      productName: product.name,
      quantity: Number(quantity),
      unitPrice: product.price,
      total: Number(quantity) * product.price
    };

    setCart([...cart, cartItem]);
    
    // Ekleme sonrası ürün seçici formunu temizliyorum
    setSelectedProductId('');
    setQuantity(1);
  };

  // Sepetten yanlış eklenen bir ürünü silme
  const removeFromCart = (indexToRemove: number) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  // Sepeti onaylayıp faturayı (Siparişi) backend'e gönderme işlemi
  const handleSubmitOrder = () => {
    setErrors([]);
    
    if (!selectedAccountId) {
      setErrors(["Lütfen siparişi keseceğiniz Müşteriyi seçin."]);
      return;
    }
    if (cart.length === 0) {
      setErrors(["Sipariş oluşturmak için sepete en az bir ürün eklemelisiniz."]);
      return;
    }

    // Backend'in beklediği o 'İç İçe Sepet' (Nested DTO) yapısını tam burada inşa ediyorum.
 const payload = {
      currentAccountId: selectedAccountId,
      
      orderDate: new Date(orderDate).toISOString(), 
      
      details: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    axios.post('http://localhost:5285/api/Orders', payload)
      .then(() => {
        // Sipariş başarılı! Ekranı temizle ve listeyi tazele.
        setCart([]);
        setSelectedAccountId('');
        fetchData();
        alert("Sipariş başarıyla oluşturuldu ve stoklar düşüldü!");
      })
     .catch(err => {
        // Backend'den gelen GERÇEK hata mesajlarını ekrana basıyoruz
        if (err.response?.data?.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat();
          setErrors(errorMessages as string[]);
        } else if (err.response?.data?.message) {
          setErrors([err.response.data.message]);
        } else {
          setErrors([`Sistem Hatası: ${err.message}`]);
        }
      });
  };

  // Sepetteki kalemlerin toplam tutarını hesaplayan küçük yardımcı fonksiyon
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div style={{ color: '#334155' }}>
      <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a' }}>Sipariş (Satış) Yönetimi</h2>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        
        {/* SOL TARAF: SİPARİŞ OLUŞTURMA ALANI */}
        <div style={{ flex: '1 1 500px', backgroundColor: '#ffffff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: '#10b981' }}>🛒 Yeni Satış / Sipariş Fişi</h3>
          
          {/* Fiş Başlık Bilgileri */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Müşteri Seçin</label>
              <select 
                value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}
                style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}>
                <option value="">-- Müşteri Seçiniz --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Tarih</label>
              <input 
                type="date" 
                value={orderDate} onChange={e => setOrderDate(e.target.value)}
                style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Hızlı Sepete Ekleme Alanı */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Ürün Ekle</label>
              <select 
                value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
                style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}>
                <option value="">-- Ürün Seçiniz --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Fiyat: {p.price}₺ | Stok: {p.stockQuantity})</option>
                ))}
              </select>
            </div>
            <div style={{ width: '100px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Adet</label>
              <input 
                type="number" min="1"
                value={quantity} 
                // YENİ: Eğer içi tamamen silinirse boş bırak, silinmediyse sayıya çevir
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ padding: '10px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
              />
            </div>
            <button onClick={handleAddToCart} style={{ padding: '10px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '40px' }}>
              + Sepete At
            </button>
          </div>

          {/* Hata Mesajları */}
          {errors.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {errors.map((err, index) => <li key={index}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* Sepet Listesi */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
              <span>Sepetteki Ürünler</span>
            </div>
            
            {cart.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Sepetiniz şu an boş.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {cart.map((item, index) => (
                  <li key={index} style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div>
                      <strong>{item.productName}</strong> <br/>
                      <span style={{ color: '#64748b' }}>{item.quantity} Adet x {item.unitPrice} ₺</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <strong style={{ color: '#0f172a' }}>{item.total} ₺</strong>
                      <button onClick={() => removeFromCart(index)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <div style={{ padding: '15px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '1.1rem' }}>Genel Toplam: <strong style={{ color: '#10b981', fontSize: '1.3rem' }}>{cartTotal} ₺</strong></span>
              <button 
                onClick={handleSubmitOrder}
                disabled={cart.length === 0}
                style={{ padding: '12px 25px', backgroundColor: cart.length === 0 ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                Siparişi Onayla
              </button>
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: GEÇMİŞ SİPARİŞLER LİSTESİ */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '1.1rem', color: '#4f46e5' }}>📋 Geçmiş Siparişler</h3>
          
          {orders.length === 0 ? <p style={{ color: '#64748b' }}>Henüz kesilmiş bir sipariş fişi yok.</p> : null}

          {orders.map(order => (
            <div key={order.id} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ height: '4px', backgroundColor: '#4f46e5' }}></div>
              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: '#1e293b' }}>{order.orderNumber}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(order.orderDate).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                  <span style={{ color: '#64748b' }}>Müşteri:</span> <strong style={{ color: '#0f172a' }}>{order.currentAccount?.name}</strong>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '10px' }}>
                  <strong style={{ display: 'block', marginBottom: '5px', color: '#475569' }}>Kalemler:</strong>
                  <ul style={{ margin: 0, paddingLeft: '15px', color: '#64748b' }}>
                    {order.orderDetails?.map((detail: any) => (
                      <li key={detail.id}>{detail.product?.name} ({detail.quantity} adet)</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Fatura Tutarı:</span>
                  <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{order.totalAmount} ₺</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}