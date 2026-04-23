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

  const handleSend = async (event) => {
    event.preventDefault();
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
    <div className="page-shell">
      <section className="page-card">
        <div className="page-header">
          <div>
            <h1>Thông báo hệ thống</h1>
            <p>Giữ nguyên luồng gửi thông báo, chỉ chuẩn hóa lại layout và style.</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="input-grid">
          <div className="field">
            <label>Đối tượng nhận</label>
            <select
              name="recipientType"
              value={formData.recipientType}
              onChange={(event) => setFormData({ ...formData, recipientType: event.target.value })}
              className="select-input"
            >
              <option value="ALL">Tất cả người dùng</option>
              <option value="STUDENT">Chỉ sinh viên</option>
              <option value="TEACHER">Chỉ giảng viên</option>
              <option value="ADMIN">Chỉ admin</option>
            </select>
          </div>

          <div className="field">
            <label>Tiêu đề</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              className="text-input"
            />
          </div>

          <div className="field">
            <label>Nội dung</label>
            <textarea
              name="content"
              rows="4"
              value={formData.content}
              onChange={(event) => setFormData({ ...formData, content: event.target.value })}
              className="text-area"
            />
          </div>

          <button type="submit" disabled={isSending} className="primary-button">
            {isSending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </form>
      </section>

      <section className="page-card">
        <div className="list-header">
          <h3>Lịch sử thông báo</h3>
          <button type="button" className="secondary-button" onClick={loadNotifications}>
            Làm mới
          </button>
        </div>

        {loading && <div className="message-banner info">Đang tải dữ liệu...</div>}
        {error && <div className="message-banner error">Không tải được thông báo: {error}</div>}

        {!loading && !error && (
          <div className="page-shell">
            {notifications.map((notification) => (
              <article key={notification.MaThongBao} className="compact-card">
                <div className="list-header">
                  <h3>{notification.TieuDe}</h3>
                  <span className={`badge ${notification.IsRead ? 'approved' : 'pending'}`}>
                    {notification.IsRead ? 'Đã đọc' : 'Chưa đọc'}
                  </span>
                </div>
                <p>
                  Đối tượng: {notification.LoaiNguoiNhan} | Người gửi: {notification.MaNguoiGui || 'Hệ thống'}
                </p>
                <p>{notification.NoiDung}</p>
                <p>{formatDateTime(notification.NgayGui)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
