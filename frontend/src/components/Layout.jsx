import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { fetchNotifications } from '../lib/api';

const pageMeta = {
  '/thong-ke': {
    title: 'Bảng điều khiển',
    description: 'Theo dõi toàn cảnh tiến độ đề tài, báo cáo và trạng thái học kỳ.',
  },
  '/hoc-ky': {
    title: 'Quản lý học kỳ',
    description: 'Điều chỉnh các mốc thời gian và trạng thái đợt thực tập.',
  },
  '/quan-ly-de-tai': {
    title: 'Quản lý đề tài',
    description: 'Kiểm soát đề tài, giảng viên hướng dẫn và sức chứa đăng ký.',
  },
  '/de-tai-sinh-vien': {
    title: 'Đề tài dành cho sinh viên',
    description: 'Tìm đề tài phù hợp và theo dõi tiến trình đăng ký của bạn.',
  },
  '/duyet-dang-ky': {
    title: 'Duyệt đăng ký',
    description: 'Xử lý yêu cầu đăng ký đề tài của sinh viên nhanh hơn.',
  },
  '/thong-bao': {
    title: 'Thông báo',
    description: 'Gửi cập nhật đúng nhóm người dùng và theo dõi nội dung đã gửi.',
  },
  '/nhan-su': {
    title: 'Quản lý nhân sự',
    description: 'Tổ chức danh sách sinh viên, giảng viên và trạng thái tài khoản.',
  },
  '/bao-cao': {
    title: 'Quản lý báo cáo',
    description: 'Theo dõi đợt báo cáo, hạn nộp và kết quả đánh giá.',
  },
  '/doi-mat-khau': {
    title: 'Đổi mật khẩu',
    description: 'Cập nhật thông tin đăng nhập để bảo vệ tài khoản của bạn.',
  },
};

const roleMapping = {
  admin: 'ADMIN',
  teacher: 'TEACHER',
  student: 'STUDENT',
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = sessionStorage.getItem('userRole');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewingNotif, setViewingNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        const roleKey = roleMapping[role] || 'STUDENT';

        setNotifications(
          data
            .filter((item) => item.LoaiNguoiNhan === 'ALL' || item.LoaiNguoiNhan === roleKey)
            .map((item) => ({
              id: item.MaThongBao,
              title: item.TieuDe,
              detail: item.NoiDung,
              isRead: Boolean(item.IsRead),
            })),
        );
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [role]);

  const unreadCount = Math.round(notifications.filter((item) => !item.isRead).length);
  const currentPage =
    Object.entries(pageMeta).find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ||
    pageMeta['/thong-ke'];

  const handleOpenDetail = (notif) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item)),
    );
    setViewingNotif(notif);
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <div className="app-shell">
        <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />

        <div className="app-main">
          <header className="topbar">
            <div className="topbar-stack">
              <div className="topbar-heading">
                <button
                  type="button"
                  className="topbar-menu-button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                >
                  Menu
                </button>
                <div>
                  <h2>{currentPage.title}</h2>
                  <p>{currentPage.description}</p>
                </div>
              </div>
            </div>

            <div className="topbar-actions">
              <button
                type="button"
                className="danger-button"
                onClick={handleLogout}
                style={{ padding: '8px 16px', fontWeight: 'bold' }}
              >
                Đăng xuất
              </button>

              <div className="dropdown-stack">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowNotifications((prev) => !prev)}
                >
                  Thông báo
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div className="dropdown-panel">
                    <div className="dropdown-heading">
                      <h4>Thông báo</h4>
                      <button type="button" className="ghost-button" onClick={handleMarkAllAsRead}>
                        Đánh dấu đã đọc
                      </button>
                    </div>

                    <div className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            type="button"
                            className={`notification-item ${notif.isRead ? '' : 'unread'}`}
                            onClick={() => handleOpenDetail(notif)}
                          >
                            <strong>{notif.title}</strong>
                            <p>{notif.detail}</p>
                          </button>
                        ))
                      ) : (
                        <div className="empty-state">
                          <p>Chưa có thông báo nào dành cho bạn.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="content-shell">
            <Outlet />

            {viewingNotif && (
              <div className="modal-inline">
                <div className="modal-card">
                  <h3>{viewingNotif.title}</h3>
                  <p>{viewingNotif.detail}</p>
                  <div className="button-row">
                    <button type="button" className="primary-button" onClick={() => setViewingNotif(null)}>
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close panels"
          className="overlay-scrim"
          onClick={() => {
            setIsSidebarOpen(false);
            setShowNotifications(false);
          }}
        />
      )}
    </>
  );
}
