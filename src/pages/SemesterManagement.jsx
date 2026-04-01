import { useState } from 'react';

export default function SemesterManagement() {
  // --- Dữ liệu khởi tạo ---
  const [semesters, setSemesters] = useState([
    { id: 'HK1_24', name: 'Học kỳ I (2024-2025)', startDate: '2024-08-15', endDate: '2024-12-31', status: 'OPEN' },
    { id: 'HK2_24', name: 'Học kỳ II (2024-2025)', startDate: '2025-01-15', endDate: '2025-05-31', status: 'CLOSED' }
  ]);

  // --- Quản lý trạng thái UI & Form ---
  const [isAdding, setIsAdding] = useState(false);
  const [editTopicId, setEditTopicId] = useState(null); 
  const [editFormData, setEditFormData] = useState({ id: '', name: '', startDate: '', endDate: '', status: 'CLOSED' });
  const [newSem, setNewSem] = useState({ id: '', name: '', startDate: '', endDate: '', status: 'CLOSED' });

  // --- Logic Chỉnh sửa ---
  const handleEditClick = (sem) => {
    setEditTopicId(sem.id);
    setEditFormData({ ...sem });
    setIsAdding(false);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = () => {
    setSemesters(semesters.map((sem) => sem.id === editTopicId ? { ...editFormData } : sem));
    setEditTopicId(null);
  };

  // --- Logic Khóa/Mở nhanh ---
  const toggleStatus = (id) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, status: s.status === 'OPEN' ? 'CLOSED' : 'OPEN' } : s));
  };

  // --- Logic Xóa (Có xác nhận) ---
  const handleDelete = (sem) => {
    if (window.confirm(`Xác nhận xóa học kỳ: ${sem.name}?`)) {
      setSemesters(semesters.filter(s => s.id !== sem.id));
    }
  };

  // --- Logic Thêm mới ---
  const handleSaveNew = () => {
    if (!newSem.id || !newSem.name) return alert("Vui lòng nhập đủ thông tin!");
    if (semesters.some(s => s.id === newSem.id)) return alert("Mã đã tồn tại!");
    setSemesters([newSem, ...semesters]);
    setIsAdding(false);
    setNewSem({ id: '', name: '', startDate: '', endDate: '', status: 'CLOSED' });
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>QUẢN LÝ HỌC KỲ</h2>
      
      {!isAdding && !editTopicId && (
        <button onClick={() => setIsAdding(true)} style={btnAddStyle}>+ Tạo Học Kỳ Mới</button>
      )}

      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>Mã HK</th>
            <th style={thStyle}>Tên Học Kỳ</th>
            <th style={thStyle}>Thời gian</th>
            <th style={thStyle}>Trạng thái</th>
            <th style={thStyle}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {/* Form thêm mới */}
          {isAdding && (
            <tr style={{ background: '#f0fdf4' }}>
              <td style={tdStyle}><input type="text" placeholder="Mã..." value={newSem.id} onChange={(e) => setNewSem({...newSem, id: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}><input type="text" placeholder="Tên..." value={newSem.name} onChange={(e) => setNewSem({...newSem, name: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}>
                <input type="date" onChange={(e) => setNewSem({...newSem, startDate: e.target.value})} style={{...inputStyle, marginBottom: '4px'}} />
                <input type="date" onChange={(e) => setNewSem({...newSem, endDate: e.target.value})} style={inputStyle} />
              </td>
              <td style={tdStyle}>Mặc định: ĐÓNG</td>
              <td style={tdStyle}>
                <button onClick={handleSaveNew} style={btnSaveStyle}>Lưu</button>
                <button onClick={() => setIsAdding(false)} style={btnCancelStyle}>Hủy</button>
              </td>
            </tr>
          )}

          {semesters.map((sem) => (
            <tr key={sem.id} style={rowStyle}>
              {editTopicId === sem.id ? (
                /* Chế độ Sửa */
                <>
                  <td style={tdStyle}><b>{sem.id}</b></td>
                  <td style={tdStyle}><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} style={inputStyle} /></td>
                  <td style={tdStyle}>
                    <input type="date" name="startDate" value={editFormData.startDate} onChange={handleEditFormChange} style={{...inputStyle, marginBottom: '4px'}} />
                    <input type="date" name="endDate" value={editFormData.endDate} onChange={handleEditFormChange} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <select name="status" value={editFormData.status} onChange={handleEditFormChange} style={inputStyle}>
                      <option value="OPEN">MỞ</option>
                      <option value="CLOSED">ĐÓNG</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={handleSaveEdit} style={btnSaveStyle}>Lưu</button>
                    <button onClick={() => setEditTopicId(null)} style={btnCancelStyle}>Hủy</button>
                  </td>
                </>
              ) : (
                /* Chế độ Xem */
                <>
                  <td style={tdStyle}>{sem.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sem.name}</td>
                  <td style={tdStyle}>{sem.startDate} <br/> đến {sem.endDate}</td>
                  <td style={tdStyle}>
                    <span style={{ ...badgeStyle, background: sem.status === 'OPEN' ? '#dcfce7' : '#fee2e2', color: sem.status === 'OPEN' ? '#166534' : '#991b1b' }}>
                      {sem.status === 'OPEN' ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleStatus(sem.id)} style={{ ...btnActionStyle, background: sem.status === 'OPEN' ? '#ef4444' : '#22c55e', color: '#fff' }}>
                      {sem.status === 'OPEN' ? 'Khóa' : 'Mở'}
                    </button>
                    <button onClick={() => handleEditClick(sem)} style={btnEditStyle}>Sửa</button>
                    <button onClick={() => handleDelete(sem)} style={btnDeleteStyle}>Xóa</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Hệ thống Styles ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const headerStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const btnAddStyle = { marginBottom: '20px', padding: '10px 18px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadRowStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '15px 12px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' };
const tdStyle = { padding: '15px 12px', fontSize: '14px' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const inputStyle = { width: '90%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' };
const btnSaveStyle = { background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancelStyle = { background: '#94a3b8', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' };
const btnActionStyle = { border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnEditStyle = { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' };
const btnDeleteStyle = { background: '#64748b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' };
const badgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' };