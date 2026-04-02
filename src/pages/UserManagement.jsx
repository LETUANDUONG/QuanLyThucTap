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
      setStudents(studentData.map((student) => ({
        id: student.MaSinhVien,
        username: student.TenDangNhap,
        name: student.HoTen,
        className: student.Lop,
        email: student.Email,
        status: student.TrangThai,
      })));
      setTeachers(teacherData.map((teacher) => ({
        id: teacher.MaGiangVien,
        username: teacher.TenDangNhap,
        name: teacher.HoTen,
        department: teacher.BoMon,
        email: teacher.Email,
        status: teacher.TrangThai,
      })));
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
    if (!window.confirm(`Xac nhan xoa tai khoan ${user.id}?`)) return;

    try {
      await deleteUser(activeTab, user.id);
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const users = activeTab === 'student' ? students : teachers;

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>QUAN LY TAI KHOAN VA NHAN SU</h2>

      <div style={tabContainerStyle}>
        <button onClick={() => { setActiveTab('student'); setIsAdding(false); }} style={{ ...tabButtonStyle, color: activeTab === 'student' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'student' ? '3px solid #2563eb' : '3px solid transparent' }}>Quan ly sinh vien</button>
        <button onClick={() => { setActiveTab('teacher'); setIsAdding(false); }} style={{ ...tabButtonStyle, color: activeTab === 'teacher' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'teacher' ? '3px solid #2563eb' : '3px solid transparent' }}>Quan ly giang vien</button>
      </div>

      <div style={actionContainerStyle}>
        <button onClick={() => setIsAdding(true)} style={btnAddStyle}>+ Them {activeTab === 'student' ? 'sinh vien' : 'giang vien'}</button>
        <button onClick={loadUsers} style={btnRefreshStyle}>Lam moi</button>
      </div>

      {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc nhan su: {error}</p>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={thStyle}>{activeTab === 'student' ? 'Ma SV' : 'Ma GV'}</th>
                <th style={thStyle}>Ho va ten</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>{activeTab === 'student' ? 'Lop' : 'Bo mon'}</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Trang thai</th>
                <th style={thStyle}>Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {isAdding && (
                <tr style={formRowStyle}>
                  <td style={tdStyle}><input value={newUser.id} onChange={(e) => setNewUser({ ...newUser, id: e.target.value })} style={inputStyle} /></td>
                  <td style={tdStyle}><input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} style={inputStyle} /></td>
                  <td style={tdStyle}><input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} style={inputStyle} /></td>
                  <td style={tdStyle}><input value={newUser.extra} onChange={(e) => setNewUser({ ...newUser, extra: e.target.value })} style={inputStyle} /></td>
                  <td style={tdStyle}><input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} style={inputStyle} /></td>
                  <td style={tdStyle}>ACTIVE</td>
                  <td style={tdStyle}>
                    <button onClick={handleCreate} style={btnActionPrimaryStyle}>Luu</button>
                    <button onClick={() => setIsAdding(false)} style={btnActionSecondaryStyle}>Huy</button>
                  </td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.id} style={rowStyle}>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.name}</td>
                  <td style={tdStyle}>{user.username}</td>
                  <td style={tdStyle}>{activeTab === 'student' ? user.className : user.department}</td>
                  <td style={{ ...tdStyle, color: '#2563eb' }}>{user.email}</td>
                  <td style={tdStyle}>
                    <span style={{ ...badgeStyle, background: user.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: user.status === 'ACTIVE' ? '#166534' : '#991b1b' }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleToggle(user)} style={user.status === 'ACTIVE' ? btnLockStyle : btnUnlockStyle}>
                      {user.status === 'ACTIVE' ? 'Khoa' : 'Mo'}
                    </button>
                    <button onClick={() => handleDelete(user)} style={btnDeleteStyle}>Xoa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', color: '#1e293b' };
const tabContainerStyle = { display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' };
const tabButtonStyle = { padding: '12px 25px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '-2px', transition: '0.3s' };
const actionContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '20px' };
const btnAddStyle = { padding: '10px 18px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const btnRefreshStyle = { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '15px 12px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' };
const tdStyle = { padding: '15px 12px', fontSize: '14px', color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const formRowStyle = { background: '#f0fdf4' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' };
const badgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };
const btnActionPrimaryStyle = { background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' };
const btnActionSecondaryStyle = { background: '#94a3b8', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnLockStyle = { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' };
const btnUnlockStyle = { background: '#22c55e', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' };
const btnDeleteStyle = { background: '#334155', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
