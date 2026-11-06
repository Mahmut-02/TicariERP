import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ProductsPage from './features/products/pages/ProductsPage';
import CurrentAccountsPage from './features/currentAccounts/pages/CurrentAccountsPage';
import OrdersPage from './features/orders/pages/OrdersPage';
import LoginPage from './features/auth/pages/LoginPage'; // YENİ EKLENDİ

// Tarayıcının hafızasında token (bilet) var mı diye bakan küçük koruma kalkanı
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN SAYFASI MENÜDEN BAĞIMSIZ OLARAK BURADA */}
        <Route path="/login" element={<LoginPage />} />

        {/* DİĞER TÜM SAYFALAR KORUMA KALKANI (ProtectedRoute) İÇİNE ALINDI */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="urunler" element={<ProductsPage />} />
          <Route path="cariler" element={<CurrentAccountsPage />} />
          <Route path="siparisler" element={<OrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;