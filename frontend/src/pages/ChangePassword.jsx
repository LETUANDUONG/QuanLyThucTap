import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../lib/api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const [formData, setFormData] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

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
    <div className="page-shell">
      <section className="page-card" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="page-header">
          <div>
            <h1>Doi mat khau</h1>
            <p>Cap nhat thong tin dang nhap voi giao dien don gian va dong deu.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="input-grid">
          <input
            type="password"
            placeholder="Mat khau hien tai"
            required
            className="text-input"
            onChange={(event) => setFormData({ ...formData, oldPass: event.target.value })}
          />
          <input
            type="password"
            placeholder="Mat khau moi"
            required
            className="text-input"
            onChange={(event) => setFormData({ ...formData, newPass: event.target.value })}
          />
          <input
            type="password"
            placeholder="Xac nhan mat khau moi"
            required
            className="text-input"
            onChange={(event) => setFormData({ ...formData, confirmPass: event.target.value })}
          />

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Dang cap nhat...' : 'Cap nhat mat khau'}
          </button>
        </form>
      </section>
    </div>
  );
}
