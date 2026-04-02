import { useEffect, useMemo, useState } from 'react';
import { createNotification, fetchNotifications } from '../lib/api';

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN');
};

export default function NotificationManagement() {
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const [formData, setFormData] = useState({ title: '', content: '', recipientType: 'ALL' });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      setIsSending(true);
      await createNotification({
        ...formData,
        senderId: currentUser.profile?.id || null,
      });
      setFormData({ title: '', content: '', recipientType: 'ALL' });
      await loadNotifications();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>THONG BAO HE THONG</h2>

      <form onSubmit={handleSend} style={formStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Doi tuong nhan</label>
          <select name="recipientType" value={formData.recipientType} onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })} style={inputStyle}>
            <option value="ALL">Tat ca nguoi dung</option>
            <option value="STUDENT">Chi sinh vien</option>
            <option value="TEACHER">Chi giang vien</option>
            <option value="ADMIN">Chi admin</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Tieu de</label>
          <input type="text" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Noi dung</label>
          <textarea name="content" rows="4" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <button type="submit" disabled={isSending} style={{ ...btnStyle, background: isSending ? '#94a3b8' : '#2563eb' }}>
          {isSending ? 'DANG GUI...' : 'GUI THONG BAO'}
        </button>
      </form>

      <div style={listWrapperStyle}>
        <div style={listHeaderStyle}>
          <h3 style={{ margin: 0 }}>Lich su thong bao</h3>
          <button onClick={loadNotifications} style={btnRefreshStyle}>Lam moi</button>
        </div>

        {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
        {error && <p style={errorStyle}>Khong tai duoc thong bao: {error}</p>}

        {!loading && !error && (
          <div style={listStyle}>
            {notifications.map((notification) => (
              <article key={notification.MaThongBao} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={cardTitleStyle}>{notification.TieuDe}</h3>
                  <span style={{ ...badgeStyle, background: notification.IsRead ? '#e2e8f0' : '#dbeafe', color: notification.IsRead ? '#475569' : '#1d4ed8' }}>
                    {notification.IsRead ? 'Da doc' : 'Chua doc'}
                  </span>
                </div>
                <p style={metaStyle}>Doi tuong: {notification.LoaiNguoiNhan} | Nguoi gui: {notification.MaNguoiGui || 'He thong'}</p>
                <p style={contentStyle}>{notification.NoiDung}</p>
                <p style={timeStyle}>{formatDateTime(notification.NgayGui)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const headerStyle = { margin: '0 0 25px 0', color: '#1e293b', fontSize: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', textAlign: 'center' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '14px', fontWeight: 'bold', color: '#475569' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };
const btnStyle = { padding: '14px', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', transition: 'all 0.2s' };
const listWrapperStyle = { marginTop: '28px' };
const listHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' };
const btnRefreshStyle = { padding: '10px 18px', color: '#fff', background: '#2563eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };
const cardStyle = { padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' };
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px' };
const cardTitleStyle = { margin: 0, fontSize: '17px', color: '#1e293b' };
const badgeStyle = { padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' };
const metaStyle = { margin: '0 0 10px 0', color: '#64748b', fontSize: '13px' };
const contentStyle = { margin: '0 0 10px 0', color: '#334155', lineHeight: 1.5 };
const timeStyle = { margin: 0, color: '#94a3b8', fontSize: '12px' };
