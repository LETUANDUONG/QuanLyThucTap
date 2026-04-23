import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = await loginRequest(username, password);
      const user = payload.data || payload; // Support both new {data, token} and old format
      const token = payload.token || user.token; 

      sessionStorage.setItem('isAuthenticated', 'true');
      if (token) sessionStorage.setItem('token', token);
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div>
          <div className="auth-brand">
            <span className="auth-brand-mark">TT</span>
            <span className="auth-brand-copy">
              <strong>Internship Hub</strong>
              <span>Quản lý đề tài thực tập</span>
            </span>
          </div>

          <h1>Giao diện quản lý thực tập gọn hơn, rõ hơn, nhanh hơn.</h1>
          <p>
            Một không gian chung để quản trị đề tài, theo dõi tiến độ báo cáo và xử lý
            đăng ký theo vai trò sinh viên, giảng viên, quản trị viên.
          </p>

          <div className="auth-stat-grid">
            <div className="auth-stat">
              <strong>3</strong>
              <span>nhóm người dùng trong cùng hệ thống</span>
            </div>
            <div className="auth-stat">
              <strong>1</strong>
              <span>luồng quản lý thống nhất từ đề tài đến báo cáo</span>
            </div>
            <div className="auth-stat">
              <strong>24/7</strong>
              <span>truy cập và theo dõi tiến độ tức thời</span>
            </div>
          </div>
        </div>

        <p>
          Tài khoản mẫu trong cơ sở dữ liệu: <strong>admin</strong>, <strong>gv01</strong>,
          {' '}
          <strong>sv01</strong> với mật khẩu <strong>123456</strong>.
        </p>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <p className="eyebrow">Đăng nhập</p>
          <h2>Chào mừng quay lại</h2>
          <p>Đăng nhập để tiếp tục làm việc với dữ liệu thực tập của bạn.</p>

          <form onSubmit={handleLogin}>
            {error && <div className="message-banner error">{error}</div>}

            <div className="field">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                className="text-input"
                placeholder="Nhập admin, gv01 hoặc sv01"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                className="text-input"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button type="submit" className="primary-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-footer-note">
            Backend đang xác thực trực tiếp với bảng tài khoản trong SQL Server.
          </div>
        </div>
      </section>
    </div>
  );
}
