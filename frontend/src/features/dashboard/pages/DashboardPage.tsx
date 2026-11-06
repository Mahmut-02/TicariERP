import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5285/api/Orders').then(res => {
      const orders = res.data;
      setOrderCount(orders.length);
      const revenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      setTotalRevenue(revenue);
      const sortedOrders = [...orders].sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      setRecentOrders(sortedOrders.slice(0, 5));
    }).catch(err => console.log(err));

    axios.get('http://localhost:5285/api/CurrentAccounts').then(res => {
      setCustomerCount(res.data.length);
    }).catch(err => console.log(err));

    axios.get('http://localhost:5285/api/Products').then(res => {
      const lowStock = res.data.filter((p: any) => p.stockQuantity < 10);
      setLowStockProducts(lowStock);
    }).catch(err => console.log(err));
  }, []);

  // DAHA BELİRGİN GÖLGE VE YÜKSEK KALKIŞ EFEKTİ (Üst 4'lü kartlar için)
  const cardClasses = "bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col gap-2 relative overflow-hidden group cursor-default";

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* BAŞLIK */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Şirket Özeti</h2>
      </div>

      {/* 4'LÜ ÜST KARTLAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Ciro Kartı */}
        <div className={cardClasses}>
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-slate-400 font-medium text-sm">Toplam Ciro</span>
          <strong className="text-3xl font-bold text-slate-800">{totalRevenue.toLocaleString('tr-TR')} ₺</strong>
        </div>

        {/* Sipariş Kartı */}
        <div className={cardClasses}>
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-slate-400 font-medium text-sm">Kesilen Fiş / Sipariş</span>
          <strong className="text-3xl font-bold text-slate-800">{orderCount} Adet</strong>
        </div>

        {/* Müşteri Kartı */}
        <div className={cardClasses}>
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-slate-400 font-medium text-sm">Kayıtlı Cari Hesap</span>
          <strong className="text-3xl font-bold text-slate-800">{customerCount} Hesap</strong>
        </div>

        {/* Stok Uyarı Kartı */}
        <div className={cardClasses}>
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-slate-400 font-medium text-sm">Kritik Stok Uyarısı</span>
          <strong className={`text-3xl font-bold ${lowStockProducts.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {lowStockProducts.length} Ürün
          </strong>
        </div>

      </div>

      {/* ALT 2'Lİ TABLO BÖLÜMÜ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Son Satışlar Tablosu */}
        <div className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-1 transition-all duration-300 md:col-span-2">
          <h3 className="text-slate-800 font-bold mb-6">Son 5 Satış Hareketi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">Tarih</th>
                  <th className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">Fiş No</th>
                  <th className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">Müşteri</th>
                  <th className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-sm text-slate-500 text-center">Henüz satış yapılmadı.</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 text-sm text-slate-500">{new Date(order.orderDate).toLocaleDateString('tr-TR')}</td>
                      <td className="py-4 text-sm text-slate-700 font-medium">SP-{order.id.substring(0,8).toUpperCase()}</td>
                      <td className="py-4 text-sm text-slate-600">{order.currentAccount?.name || 'Bilinmiyor'}</td>
                      <td className="py-4 text-sm font-bold text-slate-800 text-right">{order.totalAmount.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stok Uyarısı Listesi */}
        <div className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-rose-500 font-bold mb-6">Tükenmek Üzere Olanlar</h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Tüm ürünlerin stoğu yeterli seviyede.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-rose-50 hover:-translate-y-0.5 transition-all duration-300 group cursor-default shadow-sm hover:shadow-md hover:shadow-rose-100">
                  <div>
                    <div className="text-sm font-bold text-slate-800 group-hover:text-rose-700 transition-colors">{product.name}</div>
                    <div className="text-xs text-slate-500">Fiyat: {product.price} ₺</div>
                  </div>
                  <div className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    {product.stockQuantity} Adet
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}