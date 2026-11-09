import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [currentAccountId, setCurrentAccountId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  const fetchData = () => {
    axios.get('http://localhost:5285/api/Orders')
      .then(res => {
        const sortedOrders = [...res.data].sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(sortedOrders);
      })
      .catch(err => console.log(err));

    axios.get('http://localhost:5285/api/Products').then(res => setProducts(res.data)).catch(console.log);
    axios.get('http://localhost:5285/api/CurrentAccounts').then(res => setAccounts(res.data)).catch(console.log);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccountId || !productId) return alert("Lütfen müşteri ve ürün seçtiğinizden emin olun.");

    const payload = {
      currentAccountId: Number(currentAccountId),
      orderItems: [{ productId: Number(productId), quantity: Number(quantity) }]
    };

    axios.post('http://localhost:5285/api/Orders', payload)
      .then(() => {
        fetchData();
        setProductId('');
        setQuantity('1');
      })
      .catch(err => alert("Sipariş oluşturulamadı: " + (err.response?.data?.message || err.message)));
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Bu siparişi tamamen silmek istediğinize emin misiniz?")) {
      axios.delete(`http://localhost:5285/api/Orders/${id}`)
        .then(() => fetchData());
    }
  };

  // PDF OLUŞTURMA FONKSİYONU
  const generateInvoice = (order: any) => {
    const doc = new jsPDF();
    const orderNo = `SP-${order.id.substring(0,8).toUpperCase()}`;
    const date = new Date(order.orderDate).toLocaleDateString('tr-TR');
    const customerName = order.currentAccount?.name || 'Bilinmeyen Musteri';

    // Şirket Başlığı
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("TICARI ERP", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Merkez Sube - Teknoloji A.S.", 14, 30);
    
    // Fatura Başlığı
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text("SATIS FATURASI", 14, 45);

    // Müşteri ve Fiş Bilgileri
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(`Fatura No: ${orderNo}`, 14, 55);
    doc.text(`Tarih: ${date}`, 14, 62);
    doc.text(`Musteri: ${customerName}`, 14, 69);

    // Tablo (Sipariş Kalemleri)
    // Not: MVP'de detaylı orderItems dönmüyorsa bile genel tutarı yazdırıyoruz
    autoTable(doc, {
      startY: 80,
      head: [['Aciklama', 'Tutar (TL)']],
      body: [
        ['Siparis Bedeli', `${order.totalAmount.toLocaleString('tr-TR')} TL`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { top: 10 }
    });

    // Toplam Tutar Alanı
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`GENEL TOPLAM: ${order.totalAmount.toLocaleString('tr-TR')} TL`, 14, finalY + 15);

    // PDF'i yeni sekmede aç veya indir
    doc.save(`Fatura_${orderNo}.pdf`);
  };

  const cardClasses = "bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col group";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Siparişler ve Satışlar</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-700 mb-4">🛒 Hızlı Satış Yap</h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Müşteri (Cari) Seç</label>
            <select required value={currentAccountId} onChange={e => setCurrentAccountId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium cursor-pointer">
              <option value="">-- Müşteri Seçin --</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ürün Seç</label>
            <select required value={productId} onChange={e => setProductId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium cursor-pointer">
              <option value="">-- Ürün Seçin --</option>
              {products.map(p => (
                <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                  {p.name} - {p.price} ₺ {p.stockQuantity <= 0 ? '(Stok Yok)' : `(Stok: ${p.stockQuantity})`}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adet</label>
            <input required type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium text-center" />
          </div>
          <div className="w-full md:w-auto">
            <button type="submit"
              className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-300 w-full md:w-auto">
              Satışı Tamamla
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order.id} className={cardClasses}>
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fiş No</div>
                <div className="text-lg font-bold text-slate-800">SP-{order.id.substring(0,8).toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tarih</div>
                <div className="text-sm font-medium text-slate-600">{new Date(order.orderDate).toLocaleDateString('tr-TR')}</div>
              </div>
            </div>

            <div className="flex-1 mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Müşteri</div>
              <div className="text-base font-bold text-slate-700 mb-4">{order.currentAccount?.name || 'Bilinmeyen Müşteri'}</div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tutar</div>
                <div className="text-2xl font-bold text-emerald-600">{order.totalAmount.toLocaleString('tr-TR')} ₺</div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 mt-auto">
              {/* YENİ EKLENEN PDF BUTONU */}
              <button onClick={() => generateInvoice(order)}
                className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-bold rounded-lg transition-colors border border-blue-100">
                📄 Fatura (PDF)
              </button>
              
              <button onClick={() => handleDelete(order.id)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-sm font-bold rounded-lg transition-colors border border-slate-100">
                İptal Et / Sil
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400 font-medium">Henüz hiç sipariş / satış bulunmuyor.</div>
        )}
      </div>
    </div>
  );
}