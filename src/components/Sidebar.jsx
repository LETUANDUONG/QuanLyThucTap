import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const role = sessionStorage.getItem('userRole');
  const location = useLocation();

  // Xử lý logic Active Link (Tô đậm mục đang chọn)
  const getLinkStyle = (path) => {
    const isActive = location.pathname.startsWith(path);
    
    return {
      ...linkBaseStyle,
      color: isActive ? '#2563eb' : '#334155',
      background: isActive ? '#eff6ff' : 'transparent',
    };
  };

  return (
    <div style={sidebarContainerStyle}>
      {/* Brand & Role info */}
      <div style={headerStyle}>
        <h3 style={brandStyle}>HỆ THỐNG THỰC TẬP</h3>
        {(role=== 'admin' || role === 'teacher') && (<p style={roleStyle}>VAI TRÒ: {role}</p>)}
      </div>

      {/* Navigation Menu */}
      <div style={menuContainerStyle}>
        <ul style={listStyle}>
          
          {(role === 'admin' || role === 'teacher') && (
            <li>
              <Link to="/thong-ke" style={getLinkStyle('/thong-ke')}>
                BẢNG THỐNG KÊ
              </Link>
            </li>
          )}

          {role === 'admin' && (
            <li>
              <Link to="/hoc-ky" style={getLinkStyle('/hoc-ky')}>
                QUẢN LÝ HỌC KỲ
              </Link>
            </li>
          )}

          {(role === 'admin' || role === 'teacher') && (
            <li>
              <Link to="/quan-ly-de-tai" style={getLinkStyle('/quan-ly-de-tai')}>
                QUẢN LÝ ĐỀ TÀI
              </Link>
            </li>
          )}

          {role === 'student' && (
            <li>
              <Link to="/de-tai-sinh-vien" style={getLinkStyle('/de-tai-sinh-vien')}>
                ĐĂNG KÝ ĐỀ TÀI
              </Link>
            </li>
          )}
          
          {role === 'teacher' && (
            <li>
              <Link to="/duyet-dang-ky" style={getLinkStyle('/duyet-dang-ky')}>
                DUYỆT ĐĂNG KÝ
              </Link>
            </li>
          )}

          {/* MỤC MỚI: QUẢN LÝ THÔNG BÁO (Dành cho Admin & Teacher) */}
          {(role === 'admin' || role === 'teacher') && (
            <li>
              <Link to="/thong-bao" style={getLinkStyle('/thong-bao')}>
                QUẢN LÝ THÔNG BÁO
              </Link>
            </li>
          )}

          {role === 'admin' && (
            <li>
              <Link to="/nhan-su" style={getLinkStyle('/nhan-su')}>
                SINH VIÊN/ GIẢNG VIÊN
              </Link>
            </li>
          )}

          <li>
            <Link to="/bao-cao" style={getLinkStyle('/bao-cao')}>
              BÁO CÁO
            </Link>
          </li>
          
        </ul>
      </div>
    </div>
  );
}

// --- Styles Giữ Nguyên ---
const sidebarContainerStyle = { 
  width: '260px', 
  height: '100vh',
  background: '#fff', 
  borderRight: '1px solid #e2e8f0', 
  display: 'flex', 
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale'
};

const headerStyle = { 
  padding: '30px 20px 20px 20px', 
  borderBottom: '1px solid #e2e8f0',
  marginBottom: '10px',
  width: '100%', 
  boxSizing: 'border-box' 
};

const brandStyle = { 
  margin: 0, 
  fontSize: '18px',
  color: '#1e293b',
  fontWeight: '800',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const roleStyle = { 
  margin: '5px 0 0 0', 
  fontSize: '11px', 
  color: '#3b82f6', 
  fontWeight: 'bold', 
  textTransform: 'uppercase' 
};

const menuContainerStyle = { 
  padding: '15px', 
  flex: 1 
};

const listStyle = { 
  listStyle: 'none', 
  padding: 0, 
  margin: 0, 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '5px' 
};

const linkBaseStyle = {
  display: 'block', 
  padding: '12px 15px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '14px',
  transition: 'all 0.2s ease'
};