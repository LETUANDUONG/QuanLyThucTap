import { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../lib/api';

const departmentColors = ['progress-1', 'progress-2', 'progress-3', 'progress-4', 'progress-5'];

const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN');
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const departments = summary?.departments || [];
  const totalStudents = Math.round(summary?.totalStudents || 0);
  const studentsWithTopics = Math.round(summary?.studentsWithTopics || 0);
  const waitingStudents = Math.max(totalStudents - studentsWithTopics, 0);
  const approvalRate = totalStudents ? Math.round((studentsWithTopics / totalStudents) * 100) : 0;
  const currentSemester = summary?.currentSemester || null;
  const upcomingSemester = currentSemester
    ? {
        name: currentSemester.TenHocKy,
        startDate: currentSemester.NgayBatDau,
        endDate: currentSemester.NgayKetThuc,
        status: currentSemester.TrangThai,
      }
    : null;

  return (
    <div className="page-shell">
      <section className="stats-grid">
        <article className="kpi-card blue">
          <span className="kpi-label">Tổng sinh viên</span>
          <h3 className="kpi-value">{totalStudents}</h3>
        </article>
        <article className="kpi-card teal">
          <span className="kpi-label">Đã có đề tài</span>
          <h3 className="kpi-value">{studentsWithTopics}</h3>
        </article>
        <article className="kpi-card orange">
          <span className="kpi-label">Chưa đăng ký</span>
          <h3 className="kpi-value">{waitingStudents}</h3>
        </article>
      </section>

      {loading && <div className="message-banner info">Đang tải thống kê...</div>}
      {error && <div className="message-banner error">Không tải được thống kê: {error}</div>}

      {!loading && !error && (
        <section className="split-grid">
          <article className="compact-card">
            <div className="section-header" style={{ padding: '0 0 8px' }}>
              <div>
                <h3>Quản lý đợt thực tập</h3>
              </div>
            </div>

            <div className="semester-list">
              {upcomingSemester ? (
                <div className="semester-card">
                  <div className="semester-card-header">
                    <div>
                      <h3>{upcomingSemester.name}</h3>
                      <p>
                        {formatDate(upcomingSemester.startDate)} - {formatDate(upcomingSemester.endDate)}
                      </p>
                    </div>
                    <span className={`badge ${upcomingSemester.status === 'OPEN' ? 'success' : 'muted'}`}>
                      {upcomingSemester.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Chưa có học kỳ đang hoạt động.</p>
                </div>
              )}

              <div className="semester-card">
                <div className="semester-card-header">
                  <div>
                    <h3>Dữ liệu theo bộ môn</h3>
                    <p>Tình trạng mở đề tài và tiếp nhận sinh viên.</p>
                  </div>
                </div>

                <div className="progress-list" style={{ marginTop: '14px' }}>
                  {departments.length > 0 ? (
                    departments.map((item, index) => (
                      <div key={item.name} className="progress-item">
                        <div className="progress-topline">
                          <strong>{item.name}</strong>
                          <span>{Math.round(item.percent)}%</span>
                        </div>
                        <div className="track">
                          <div
                            className={`thumb ${departmentColors[index % departmentColors.length]}`}
                            style={{
                              width: `${Math.round(item.percent)}%`,
                            }}
                          />
                        </div>
                        <div className="progress-meta">
                          {Math.round(item.openTopics)}/{Math.round(item.totalTopics)} đề tài đang mở
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>Chưa có dữ liệu bộ môn.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>

          <article className="compact-card dashboard-side-panel">
            <div className="section-header" style={{ padding: '0 0 8px' }}>
              <div>
                <h3>Quản lý tài khoản mới đây</h3>
              </div>
            </div>

            <table className="mini-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="mini-row-user">
                      <span className="mini-avatar">NV</span>
                      <strong>Nguyễn Văn A</strong>
                    </div>
                  </td>
                  <td>Sinh viên</td>
                  <td><span className="badge success">Hoạt động</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="mini-row-user">
                      <span className="mini-avatar">TB</span>
                      <strong>TS. Trần Thị B</strong>
                    </div>
                  </td>
                  <td>Giảng viên</td>
                  <td><span className="badge success">Hoạt động</span></td>
                </tr>
              </tbody>
            </table>

            <div className="semester-card dashboard-metric-card">
              <h3>Tỷ lệ đề tài được duyệt</h3>
              <p className="dashboard-metric-copy">
                Mức phủ đăng ký theo số sinh viên đã có đề tài trong toàn hệ thống.
              </p>
              <div className="track" style={{ marginTop: '14px' }}>
                <div className="thumb progress-2" style={{ width: `${approvalRate}%` }} />
              </div>
              <div className="inline-spread" style={{ marginTop: '10px' }}>
                <p>Đã phân bổ thành công</p>
                <strong>{approvalRate}%</strong>
              </div>
            </div>

            <div className="semester-card">
              <div className="inline-spread">
                <div>
                  <h3>Báo cáo chờ xử lý</h3>
                  <p>Cần xem xét hoặc chấm điểm.</p>
                </div>
                <strong>{Math.round(summary?.reportsPendingReview || 0)}</strong>
              </div>
            </div>
          </article>
        </section>
      )}
    </div>
  );
}
