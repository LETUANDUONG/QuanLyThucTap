import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../lib/api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const [formData, setFormData] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPass !== formData.confirmPass) {
      alert('Loi: Mat khau moi khong khop!');
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(username, formData.oldPass, formData.newPass);
      alert('Cap nhat mat khau thanh cong!');
      navigate('/thong-ke');
    } catch (err) {
      alert(err.message || 'Khong doi duoc mat khau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>DOI MAT KHAU</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="password"
          placeholder="Mat khau hien tai"
          required
          style={inputStyle}
          onChange={(e) => setFormData({ ...formData, oldPass: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mat khau moi"
          required
          style={inputStyle}
          onChange={(e) => setFormData({ ...formData, newPass: e.target.value })}
        />
        <input
          type="password"
          placeholder="Xac nhan mat khau moi"
          required
          style={inputStyle}
          onChange={(e) => setFormData({ ...formData, confirmPass: e.target.value })}
        />

        <button type="submit" style={btnSubmitStyle} disabled={isSubmitting}>
          {isSubmitting ? 'DANG CAP NHAT...' : 'CAP NHAT MAT KHAU'}
        </button>
      </form>
    </div>
  );
}

const containerStyle = {
  maxWidth: '450px',
  margin: '60px auto',
  background: '#fff',
  padding: '40px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};
const titleStyle = {
  marginBottom: '25px',
  textAlign: 'center',
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e293b',
};
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};
const inputStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '14px',
  transition: 'border-color 0.2s',
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
  transition: 'background 0.2s',
};
