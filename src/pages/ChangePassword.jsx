import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate mật khẩu khớp nhau
    if (formData.newPass !== formData.confirmPass) {
      alert("Lỗi: Mật khẩu mới không khớp!");
      return;
    }

    // Giả lập đổi mật khẩu thành công
    alert("✅ Đổi mật khẩu thành công!");
    navigate('/thong-ke');
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🔐 ĐỔI MẬT KHẨU</h2>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <input 
          type="password" 
          placeholder="Mật khẩu hiện tại" 
          required 
          style={inputStyle} 
          onChange={e => setFormData({...formData, oldPass: e.target.value})} 
        />
        <input 
          type="password" 
          placeholder="Mật khẩu mới" 
          required 
          style={inputStyle} 
          onChange={e => setFormData({...formData, newPass: e.target.value})} 
        />
        <input 
          type="password" 
          placeholder="Xác nhận mật khẩu mới" 
          required 
          style={inputStyle} 
          onChange={e => setFormData({...formData, confirmPass: e.target.value})} 
        />
        
        <button type="submit" style={btnSubmitStyle}>
          Cập nhật mật khẩu
        </button>
      </form>
    </div>
  );
}

// --- Styles System ---
const containerStyle = { 
  maxWidth: '450px', 
  margin: '60px auto', 
  background: '#fff', 
  padding: '40px', 
  borderRadius: '16px', 
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
};

const titleStyle = { 
  marginBottom: '25px', 
  textAlign: 'center', 
  fontSize: '20px', 
  fontWeight: 'bold', 
  color: '#1e293b' 
};

const formStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '15px' 
};

const inputStyle = { 
  padding: '12px 16px', 
  borderRadius: '8px', 
  border: '1px solid #cbd5e1', 
  outline: 'none',
  fontSize: '14px',
  transition: 'border-color 0.2s'
};

const btnSubmitStyle = { 
  padding: '12px', 
  background: '#2563eb', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: 'bold',
  fontSize: '15px',
  marginTop: '10px',
  transition: 'background 0.2s'
};