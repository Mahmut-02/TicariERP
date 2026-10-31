import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProductsPage from './features/products/pages/ProductsPage';
import CurrentAccountsPage from './features/currentAccounts/pages/CurrentAccountsPage'; // Yeni ekledik

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<ProductsPage />} />
          {/* Yapım aşamasında yazısını sildik, gerçek sayfayı bağladık */}
          <Route path="cariler" element={<CurrentAccountsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;