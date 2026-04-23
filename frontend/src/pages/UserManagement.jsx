import { useEffect, useState } from 'react';
import { createUser, deleteUser, fetchStudents, fetchTeachers, updateUserStatus } from '../lib/api';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('student');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ id: '', username: '', name: '', extra: '', email: '', phone: '' });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const [studentData, teacherData] = await Promise.all([fetchStudents(), fetchTeachers()]);
      setStudents(
        studentData.map((student) => ({
          id: student.MaSinhVien,
          username: student.TenDangNhap,
          name: student.HoTen,
          className: student.Lop,
          email: student.Email,
          status: student.TrangThai,
        })),
      );
      setTeachers(
        teacherData.map((teacher) => ({
          id: teacher.MaGiangVien,
          username: teacher.TenDangNhap,
          name: teacher.HoTen,
          department: teacher.BoMon,
          email: teacher.Email,
          status: teacher.TrangThai,
        })),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    try {
      await createUser({
        role: activeTab,
        ...newUser,
      });
      setIsAdding(false);
      setNewUser({ id: '', username: '', name: '', extra: '', email: '', phone: '' });
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggle = async (user) => {
    try {
      const nextStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      await updateUserStatus(activeTab, user.id, nextStatus);
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xác nhận xóa tài khoản ${user.id}?`)) return;

    try {
      await deleteUser(activeTab, user.id);
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const users = activeTab === 'student' ? students : teachers;
  const activeUsers = Math.round(users.filter((user) => user.status === 'ACTIVE').length);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Nhân sự</p>
          <h1>Quản lý tài khoản và nhân sự</h1>
          <p>Bố cục mới giúp chuyển nhanh giữa sinh viên và giảng viên, đồng thời giữ bảng dữ liệu gọn và rõ.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="success-button" onClick={() => setIsAdding(true)}>
            Thêm {activeTab === 'student' ? 'sinh viên' : 'giảng viên'}
          </button>
          <button type="button" className="secondary-button" onClick={loadUsers}>
            Làm mới
          </button>
        </div>
      </div>

      <div className="tab-row">
        <button
          type="button"
          className={`tab-button ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('student');
            setIsAdding(false);
          }}
        >
          Quản lý sinh viên
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'teacher' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('teacher');
            setIsAdding(false);
          }}
        >
          Quản lý giảng viên
        </button>
      </div>

      <section className="status-strip">
        <article className="stat-card surface-card inset">
          <strong>{Math.round(users.length)}</strong>
          <p>{activeTab === 'student' ? 'Sinh viên đang hiển thị' : 'Giảng viên đang hiển thị'}</p>
        </article>
        <article className="stat-card surface-card inset">
          <strong>{activeUsers}</strong>
          <p>Tài khoản đang hoạt động</p>
        </article>
        <article className="stat-card surface-card inset">
          <strong>{Math.round(users.length - activeUsers)}</strong>
          <p>Tài khoản bị khóa</p>
        </article>
      </section>

      {loading && <div className="message-banner info">Đang tải dữ liệu nhân sự...</div>}
      {error && <div className="message-banner error">Không tải được nhân sự: {error}</div>}

      {!loading && !error && (
        <section className="surface-card section-card">
          <div className="section-header">
            <div>
              <h3>{activeTab === 'student' ? 'Danh sách sinh viên' : 'Danh sách giảng viên'}</h3>
              <p className="section-subtitle">Bảng dữ liệu được thiết kế lại để nổi bật trạng thái và hành động chính.</p>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table page-table-generic-7">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>{activeTab === 'student' ? 'Mã SV' : 'Mã GV'}</th>
                  <th>Họ và tên</th>
                  <th>Username</th>
                  <th>{activeTab === 'student' ? 'Lớp' : 'Bộ môn'}</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr className="form-row">
                    <td>
                      <input
                        className="text-input"
                        value={newUser.id}
                        onChange={(event) => setNewUser({ ...newUser, id: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="text-input"
                        value={newUser.name}
                        onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="text-input"
                        value={newUser.username}
                        onChange={(event) => setNewUser({ ...newUser, username: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="text-input"
                        value={newUser.extra}
                        onChange={(event) => setNewUser({ ...newUser, extra: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="text-input"
                        value={newUser.email}
                        onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                      />
                    </td>
                    <td>
                      <span className="badge success">ACTIVE</span>
                    </td>
                    <td>
                      <div className="button-row">
                        <button type="button" className="success-button" onClick={handleCreate}>
                          Lưu
                        </button>
                        <button type="button" className="secondary-button" onClick={() => setIsAdding(false)}>
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="strong-cell">{user.id}</td>
                    <td className="strong-cell">{user.name}</td>
                    <td>{user.username}</td>
                    <td>{activeTab === 'student' ? user.className : user.department}</td>
                    <td className="link-text">{user.email}</td>
                    <td>
                      <span className={`badge ${user.status === 'ACTIVE' ? 'success' : 'danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="button-row">
                        <button
                          type="button"
                          className={user.status === 'ACTIVE' ? 'danger-button' : 'success-button'}
                          onClick={() => handleToggle(user)}
                        >
                          {user.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                        </button>
                        <button type="button" className="secondary-button" onClick={() => handleDelete(user)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
