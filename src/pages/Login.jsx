import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Hệ thống tài khoản mẫu
    const validAccounts = { 'admin': 'admin', 'teacher': 'teacher', 'student': 'student' };

    if (validAccounts[username] && validAccounts[username] === password) {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userRole', username); 
      navigate('/'); 
    } else {
      setError('❌ Tài khoản hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={loginCardStyle}>
        <div style={logoStyle}>🎓</div>
        
        <h2 style={titleStyle}>HỆ THỐNG ĐĂNG KÝ ĐỀ TÀI THỰC TẬP</h2>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>👤 Tên đăng nhập</label>
            <input 
              type="text" 
              placeholder="admin, teacher, student..."
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>🔒 Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button type="submit" style={btnLoginStyle}>
            ĐĂNG NHẬP
          </button>
        </form>

        <div style={footerStyle}>
          <p style={footerTextStyle}>Hệ thống quản lý đề tài thực tập trực tuyến</p>
        </div>
      </div>
    </div>
  );
}

// --- Styles System ---
const pageWrapperStyle = { 
  display: 'flex', justifyContent: 'center', alignItems: 'center', 
  height: '100vh', width: '100vw', margin: 0,
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
};

const loginCardStyle = {
  background: 'rgba(255, 255, 255, 0.98)', padding: '45px 40px', 
  borderRadius: '16px', width: '100%', maxWidth: '380px', 
  textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
};

const logoStyle = { fontSize: '50px', marginBottom: '15px' };

const titleStyle = { 
  margin: '0 0 12px 0', color: '#0f172a', fontSize: '24px', 
  fontWeight: '800', letterSpacing: '-0.5px', lineHeight: '1.2' 
};

const errorStyle = { 
  background: '#fef2f2', color: '#dc2626', padding: '10px', 
  borderRadius: '6px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fee2e2' 
};

const inputGroupStyle = { marginBottom: '20px', textAlign: 'left' };

const labelStyle = { display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '14px' };

const inputStyle = { 
  width: '100%', padding: '12px 15px', borderRadius: '8px', 
  border: '1px solid #e2e8f0', boxSizing: 'border-box', 
  fontSize: '15px', outline: 'none', transition: '0.2s' 
};

const btnLoginStyle = { 
  width: '100%', padding: '14px', background: '#2563eb', color: 'white', 
  border: 'none', borderRadius: '8px', fontWeight: 'bold', 
  fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)'
};

const footerStyle = { marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };

const footerTextStyle = { fontSize: '12px', color: '#94a3b8', margin: 0 };