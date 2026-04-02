import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await loginRequest(username, password);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Dang nhap that bai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={loginCardStyle}>
        <div style={logoStyle}>TT</div>

        <h2 style={titleStyle}>HE THONG DANG KY DE TAI THUC TAP</h2>

        <p style={hintStyle}>Tai khoan mau trong database: `admin`, `gv01`, `sv01` voi mat khau `123456`.</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Ten dang nhap</label>
            <input
              type="text"
              placeholder="admin, gv01, sv01..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Mat khau</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" style={btnLoginStyle} disabled={isSubmitting}>
            {isSubmitting ? 'DANG XU LY...' : 'DANG NHAP'}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={footerTextStyle}>Backend dang xac thuc truc tiep voi bang TaiKhoan trong SQL Server.</p>
        </div>
      </div>
    </div>
  );
}

const pageWrapperStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  height: '100vh', width: '100vw', margin: 0,
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
};
const loginCardStyle = {
  background: 'rgba(255, 255, 255, 0.98)', padding: '45px 40px',
  borderRadius: '16px', width: '100%', maxWidth: '380px',
  textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
};
const logoStyle = { fontSize: '28px', marginBottom: '15px', fontWeight: '900', color: '#2563eb' };
const titleStyle = {
  margin: '0 0 12px 0', color: '#0f172a', fontSize: '24px',
  fontWeight: '800', letterSpacing: '-0.5px', lineHeight: '1.2',
};
const hintStyle = { margin: '0 0 18px 0', color: '#64748b', fontSize: '13px', lineHeight: 1.5 };
const errorStyle = {
  background: '#fef2f2', color: '#dc2626', padding: '10px',
  borderRadius: '6px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fee2e2',
};
const inputGroupStyle = { marginBottom: '20px', textAlign: 'left' };
const labelStyle = { display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '14px' };
const inputStyle = {
  width: '100%', padding: '12px 15px', borderRadius: '8px',
  border: '1px solid #e2e8f0', boxSizing: 'border-box',
  fontSize: '15px', outline: 'none', transition: '0.2s',
};
const btnLoginStyle = {
  width: '100%', padding: '14px', background: '#2563eb', color: 'white',
  border: 'none', borderRadius: '8px', fontWeight: 'bold',
  fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
};
const footerStyle = { marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const footerTextStyle = { fontSize: '12px', color: '#94a3b8', margin: 0 };
