import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  
  // Ekranın Giriş Yap modunda mı yoksa Kayıt Ol modunda mı olduğunu tutuyoruz
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      // GİRİŞ YAPMA İŞLEMİ
      axios.post('http://localhost:5285/api/Auth/login', { email, password })
        .then(res => {
          // Gelen bileti (Token) tarayıcının yerel hafızasına kaydediyoruz!
          localStorage.setItem('token', res.data.token);
          // Ana sayfaya (Dashboard) yönlendiriyoruz
          navigate('/');
        })
        .catch(err => {
          setError(err.response?.data?.message || "Giriş başarısız.");
        });
    } else {
      // KAYIT OLMA İŞLEMİ
      axios.post('http://localhost:5285/api/Auth/register', { firstName, lastName, email, password })
        .then(res => {
          setSuccess(res.data.message || "Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
          setIsLogin(true); // Kayıt başarılı olunca giriş ekranına at
        })
        .catch(err => {
          setError(err.response?.data?.message || "Kayıt olurken bir hata oluştu.");
        });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', color: '#1e293b', margin: 0 }}>
            Ticari<span style={{ color: '#3b82f6' }}>ERP</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>
            {isLogin ? "Sisteme giriş yapın" : "Yeni bir hesap oluşturun"}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#10b981', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {!isLogin && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Ad</label>
                <input type="text" required={!isLogin} value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Soyad</label>
                <input type="text" required={!isLogin} value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>E-posta Adresi</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Şifre</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
          </div>

          <button type="submit" style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
          {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
            style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? "Kayıt Olun" : "Giriş Yapın"}
          </span>
        </div>
        
      </div>
    </div>
  );
}