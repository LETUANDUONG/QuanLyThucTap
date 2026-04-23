import { Link, useLocation } from 'react-router-dom';

const navigationByRole = {
  admin: [
    { to: '/thong-ke', mark: '01', title: 'Thống kê', subtitle: 'Toàn cảnh hệ thống' },
    { to: '/hoc-ky', mark: '02', title: 'Học kỳ', subtitle: 'Cấu hình đợt thực tập' },
    { to: '/quan-ly-de-tai', mark: '03', title: 'Đề tài', subtitle: 'Danh sách và trạng thái' },
    { to: '/thong-bao', mark: '04', title: 'Thông báo', subtitle: 'Gửi tin đến người dùng' },
    { to: '/nhan-su', mark: '05', title: 'Nhân sự', subtitle: 'Sinh viên và giảng viên' },
    { to: '/bao-cao', mark: '06', title: 'Báo cáo', subtitle: 'Tiến độ và nộp bài' },
  ],
  teacher: [
    { to: '/thong-ke', mark: '01', title: 'Thống kê', subtitle: 'Tiến độ giảng viên' },
    { to: '/quan-ly-de-tai', mark: '02', title: 'Đề tài', subtitle: 'Danh sách hướng dẫn' },
    { to: '/duyet-dang-ky', mark: '03', title: 'Duyệt đăng ký', subtitle: 'Xét sinh viên đăng ký' },
    { to: '/thong-bao', mark: '04', title: 'Thông báo', subtitle: 'Cập nhật cho sinh viên' },
    { to: '/bao-cao', mark: '05', title: 'Báo cáo', subtitle: 'Danh sách chấm điểm' },
  ],
  student: [
    { to: '/de-tai-sinh-vien', mark: '01', title: 'Đăng ký đề tài', subtitle: 'Chọn đề tài phù hợp' },
    { to: '/bao-cao', mark: '02', title: 'Báo cáo', subtitle: 'Xem hạn nộp và kết quả' },
  ],
};

const roleLabels = {
  admin: 'Quản trị viên',
  teacher: 'Giảng viên',
  student: 'Sinh viên',
};

export default function Sidebar({ isOpen = false, onNavigate }) {
  const role = sessionStorage.getItem('userRole') || 'student';
  const username = sessionStorage.getItem('username') || 'Khách';
  let displayName = username;
  try {
    const rawUser = sessionStorage.getItem('currentUser');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.profile?.displayName) {
        displayName = parsed.profile.displayName;
      }
    }
  } catch (e) {
    // Ignore parse error
  }

  const location = useLocation();
  const items = navigationByRole[role] || navigationByRole.student;

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-badge">TT</span>
        <div style={{ display: 'grid', gap: '4px' }}>
          <h1>Hệ thống thực tập</h1>
          <div className="user-chip-copy">
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {displayName}
            </p>
            <span>{roleLabels[role] || 'Học viên'}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="sidebar-section-label">Điều hướng</p>
        <nav className="sidebar-nav">
          {items.map((item) => {
            const isActive =
              location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
              >
                <span className="sidebar-link-mark">{item.mark}</span>
                <span className="sidebar-link-text">
                  <span className="sidebar-link-title">{item.title}</span>
                  <span className="sidebar-link-subtitle">{item.subtitle}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
