import { useState } from 'react';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('student');
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ id: '', name: '', extra: '', email: '', status: 'ACTIVE' });

  // Dữ liệu mẫu
  const [students, setStudents] = useState([
    { id: 'SV01', name: 'Nguyễn Văn C', className: 'Lop01', email: 'abc@sv.edu.vn', status: 'ACTIVE' },
    { id: 'SV02', name: 'Trần Thị B', className: 'Lop02', email: 'abc@sv.edu.vn', status: 'LOCKED' }
  ]);

  const [teachers, setTeachers] = useState([
    { id: 'GV01', name: 'Nguyễn Văn A', department: 'Công nghệ phần mềm', email: 'abc@gv.edu.vn', status: 'ACTIVE' },
    { id: 'GV02', name: 'Lê Văn C', department: 'Hệ thống thông tin', email: 'def@gv.edu.vn', status: 'ACTIVE' },
    { id: 'GV03', name: 'Phạm Minh D', department: 'An toàn thông tin', email: 'ghij@gv.edu.vn', status: 'ACTIVE' }
  ]);

  // Đảo trạng thái khóa/mở khóa tài khoản
  const handleToggleLock = (id, role) => {
    if (window.confirm(`Xác nhận thay đổi trạng thái tài khoản ${id}?`)) {
      const updateList = (list) => list.map(item => 
        item.id === id ? { ...item, status: item.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : item
      );
      
      role === 'student' ? setStudents(updateList(students)) : setTeachers(updateList(teachers));
    }
  };

  // Mô phỏng tải file Excel
  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (e) => alert(`Đã nhận: ${e.target.files[0].name}. Hệ thống đang xử lý...`);
    input.click();
  };

  // Lưu bản ghi mới
  const handleSaveNew = () => {
    if (!newUser.id || !newUser.name || !newUser.extra || !newUser.email) {
      alert("Lỗi: Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (activeTab === 'student') {
      setStudents([{ ...newUser, className: newUser.extra }, ...students]);
    } else {
      setTeachers([{ ...newUser, department: newUser.extra }, ...teachers]);
    }
    
    setIsAdding(false);
    setNewUser({ id: '', name: '', extra: '', email: '', status: 'ACTIVE' });
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>QUẢN LÝ TÀI KHOẢN & NHÂN SỰ</h2>
      
      {/* Tab Navigation */}
      <div style={tabContainerStyle}>
        <button onClick={() => { setActiveTab('student'); setIsAdding(false); }} style={{ ...tabButtonStyle, color: activeTab === 'student' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'student' ? '3px solid #2563eb' : '3px solid transparent' }}>
          Quản lý Sinh viên
        </button>
        <button onClick={() => { setActiveTab('teacher'); setIsAdding(false); }} style={{ ...tabButtonStyle, color: activeTab === 'teacher' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'teacher' ? '3px solid #2563eb' : '3px solid transparent' }}>
          Quản lý Giảng viên
        </button>
      </div>

      {/* Action Buttons */}
      <div style={actionContainerStyle}>
        <button onClick={handleImportExcel} style={btnImportStyle}>📥 Import Excel</button>
        <button onClick={() => setIsAdding(true)} style={btnAddStyle}>+ Thêm {activeTab === 'student' ? 'Sinh viên' : 'Giảng viên'}</button>
      </div>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>{activeTab === 'student' ? 'Mã SV' : 'Mã GV'}</th>
              <th style={thStyle}>Họ và Tên</th>
              <th style={thStyle}>{activeTab === 'student' ? 'Lớp' : 'Bộ môn'}</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={{ background: '#f0fdf4' }}>
                <td style={tdStyle}><input type="text" placeholder="Mã..." value={newUser.id} onChange={(e) => setNewUser({...newUser, id: e.target.value})} style={inputStyle} /></td>
                <td style={tdStyle}><input type="text" placeholder="Họ tên..." value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} style={inputStyle} /></td>
                <td style={tdStyle}><input type="text" placeholder={activeTab === 'student' ? "Lớp..." : "Bộ môn..."} value={newUser.extra} onChange={(e) => setNewUser({...newUser, extra: e.target.value})} style={inputStyle} /></td>
                <td style={tdStyle}><input type="email" placeholder="Email..." value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} style={inputStyle} /></td>
                <td style={tdStyle}>-</td>
                <td style={tdStyle}>
                  <button onClick={handleSaveNew} style={btnSaveStyle}>Lưu</button>
                  <button onClick={() => setIsAdding(false)} style={btnCancelStyle}>Hủy</button>
                </td>
              </tr>
            )}

            {(activeTab === 'student' ? students : teachers).map((user, index) => (
              <tr key={`${user.id}-${index}`} style={rowStyle}>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.id}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.name}</td>
                <td style={tdStyle}>{activeTab === 'student' ? user.className : user.department}</td>
                <td style={{ ...tdStyle, color: '#2563eb' }}>{user.email}</td>
                <td style={tdStyle}>
                  <span style={{ ...badgeStyle, background: user.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: user.status === 'ACTIVE' ? '#166534' : '#991b1b' }}>
                    {user.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => handleToggleLock(user.id, activeTab)} style={{ ...btnLockStyle, background: user.status === 'ACTIVE' ? '#ef4444' : '#22c55e' }}>
                    {user.status === 'ACTIVE' ? '🔒 Khóa' : '🔓 Mở khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', color: '#1e293b' };
const tabContainerStyle = { display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' };
const tabButtonStyle = { padding: '12px 25px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '-2px', transition: '0.3s' };
const actionContainerStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' };
const btnImportStyle = { padding: '10px 18px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const btnAddStyle = { padding: '10px 18px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '15px 12px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' };
const tdStyle = { padding: '15px 12px', fontSize: '14px', color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' };
const btnSaveStyle = { background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' };
const btnCancelStyle = { background: '#94a3b8', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const badgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };
const btnLockStyle = { padding: '6px 14px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };