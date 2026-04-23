import { useEffect, useMemo, useState } from 'react';
import { fetchRegistrationApprovals, updateRegistrationStatus } from '../lib/api';

export default function RegistrationApproval() {
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const teacherId = currentUser.profile?.id;
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchRegistrationApprovals();
      setRegistrations(
        data.map((registration) => ({
          id: registration.MaDangKy,
          studentCode: registration.MaSinhVien,
          studentName: registration.TenSinhVien,
          topicName: registration.TenDeTai,
          status: registration.TrangThai,
        })),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const mutateStatus = async (id, status, reason = null) => {
    try {
      await updateRegistrationStatus(id, { status, reason, reviewerId: teacherId });
      await loadRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Sinh viên chờ duyệt</h1>
          <p>Giữ bảng ngắn gọn, hành động nổi bật và trạng thái hiển thị rõ như mẫu teacher dashboard.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="secondary-button" onClick={loadRegistrations}>
            Làm mới
          </button>
        </div>
      </div>

      {loading && <div className="message-banner info">Đang tải dữ liệu...</div>}
      {error && <div className="message-banner error">Không tải được đăng ký: {error}</div>}

      {!loading && !error && (
        <div className="compact-card">
          <table className="mini-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>MSSV</th>
                <th>Đề tài</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id}>
                  <td>{reg.studentName}</td>
                  <td>{reg.studentCode}</td>
                  <td>{reg.topicName}</td>
                  <td>
                    {reg.status === 'PENDING' ? (
                      <div className="button-row">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => mutateStatus(reg.id, 'APPROVED')}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            const reason = window.prompt('Nhập lý do từ chối:');
                            if (reason) mutateStatus(reg.id, 'REJECTED', reason);
                          }}
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className={`badge ${reg.status === 'APPROVED' ? 'success' : 'danger'}`}>
                        {reg.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan="4" className="muted-text">Chưa có đăng ký cần xử lý.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
