import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import { fetchNotifications } from '../lib/api';

export default function Layout() {
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole');
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [viewingNotif, setViewingNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        const roleKey =
          role === 'admin' ? 'ADMIN' : role === 'teacher' ? 'TEACHER' : 'STUDENT';

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

  const profile = currentUser.profile || {};
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleOpenDetail = (notif) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    setViewingNotif(notif);
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const renderUserInfo = () => {
    switch (role) {
      case 'student':
        return (
          <>
            <div style={itemStyle}><span style={iconStyle}>ID</span> <b>MSSV:</b> {profile.id}</div>
            <div style={itemStyle}><span style={iconStyle}>LP</span> <b>Lop:</b> {profile.className || '--'}</div>
            <div style={itemStyle}><span style={iconStyle}>DT</span> <b>SDT:</b> {profile.phone || '--'}</div>
          </>
        );
      case 'teacher':
        return (
          <>
            <div style={itemStyle}><span style={iconStyle}>GV</span> <b>Ma GV:</b> {profile.id}</div>
            <div style={itemStyle}><span style={iconStyle}>BM</span> <b>Bo mon:</b> {profile.department || '--'}</div>
            <div style={itemStyle}><span style={iconStyle}>DT</span> <b>SDT:</b> {profile.phone || '--'}</div>
          </>
        );
      case 'admin':
        return <div style={itemStyle}><span style={iconStyle}>AD</span> <b>Quyen:</b> Quan tri vien</div>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: '#f8fafc', margin: 0, fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={headerStyle}>
          <div style={{ position: 'relative', marginRight: '30px' }}>
            <div
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              style={userToggleStyle}
            >
              <span style={{ fontSize: '18px', color: '#6366f1' }}>U</span>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
                Xin chao, {profile.displayName || currentUser.username || role}
              </span>
            </div>

            {showUserMenu && (
              <div style={{ ...dropdownStyle, top: '45px', right: '0', width: '320px' }}>
                {renderUserInfo()}
                <div style={itemStyle}><span style={iconStyle}>EM</span> <b>Email:</b> {profile.email || '--'}</div>
                <hr style={hrStyle} />
                <div onClick={() => { navigate('/doi-mat-khau'); setShowUserMenu(false); }} style={{ ...actionStyle, color: '#2563eb' }}>
                  <span style={iconStyle}>PW</span> Doi mat khau
                </div>
                <div onClick={handleLogout} style={{ ...actionStyle, color: '#ef4444' }}>
                  <span style={iconStyle}>OUT</span> Dang xuat
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <span onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }} style={{ cursor: 'pointer', fontSize: '22px' }}>
              N {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
            </span>

            {showNotifications && (
              <div style={{ ...dropdownStyle, top: '40px', right: '-10px', width: '320px' }}>
                <div style={notifHeaderStyle}>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>Thong bao</h4>
                  <button onClick={handleMarkAllAsRead} style={markReadBtnStyle}>Danh dau da doc</button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map((notif) => (
                    <div key={notif.id} onClick={() => handleOpenDetail(notif)} style={{ padding: '12px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: notif.isRead ? '#fff' : '#eff6ff' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: notif.isRead ? 'normal' : 'bold' }}>{notif.title}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <div style={{ padding: '12px 15px', color: '#94a3b8' }}>Khong co thong bao.</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>

      {(showNotifications || showUserMenu) && (
        <div onClick={() => { setShowNotifications(false); setShowUserMenu(false); }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 900 }} />
      )}

      {viewingNotif && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>{viewingNotif.title}</h3>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>{viewingNotif.detail}</p>
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button onClick={() => setViewingNotif(null)} style={closeBtnStyle}>Dong</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const headerStyle = { height: '60px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 30px', position: 'relative' };
const userToggleStyle = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 10px', borderRadius: '20px', transition: '0.2s' };
const dropdownStyle = { position: 'absolute', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden' };
const itemStyle = { padding: '10px 15px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px' };
const actionStyle = { ...itemStyle, cursor: 'pointer', fontWeight: 'bold' };
const iconStyle = { width: '24px', fontSize: '11px', fontWeight: 'bold', color: '#64748b' };
const hrStyle = { border: 'none', borderTop: '1px solid #f1f5f9', margin: '5px 0' };
const badgeStyle = { position: 'absolute', top: '-5px', right: '-8px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', border: '2px solid #fff' };
const markReadBtnStyle = { background: 'none', border: 'none', color: '#3b82f6', fontSize: '11px', cursor: 'pointer' };
const notifHeaderStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle = { background: '#fff', padding: '25px', borderRadius: '16px', width: '380px', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' };
const closeBtnStyle = { padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
