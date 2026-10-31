import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProductsPage from './features/products/pages/ProductsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<ProductsPage />} />
          <Route path="cariler" element={<h2>Cari Hesaplar Sayfası (Yapım Aşamasında)</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;