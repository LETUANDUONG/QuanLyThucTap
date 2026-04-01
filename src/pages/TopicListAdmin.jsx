import { useState } from 'react';

export default function TopicListAdmin() {
  const role = sessionStorage.getItem('userRole');
  const isTeacher = role === 'teacher';

  const [topics, setTopics] = useState([
    { id: 'DT01', name: 'Website TMĐT', students: '3/5', instructor: 'Nguyễn Văn A' },
    { id: 'DT02', name: 'Nhận diện Email Phishing', students: '2/5', instructor: 'Trần Thị B' },
    { id: 'DT03', name: 'Hệ thống Quản lý Sinh viên', students: '5/5', instructor: 'Lê Văn C' }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTopic, setNewTopic] = useState({ id: '', name: '', students: '', instructor: '' });
  const [editTopicId, setEditTopicId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', students: '', instructor: '' });

  // --- LOGIC THÊM MỚI ---
  const handleSaveNew = () => {
    if (!newTopic.id.trim() || !newTopic.name.trim()) return alert("Lỗi: Không được để trống mã và tên đề tài!");
    if (topics.some(t => t.id === newTopic.id)) return alert("Lỗi: Mã đề tài đã tồn tại!");

    setTopics([newTopic, ...topics]);
    setIsAdding(false);
    setNewTopic({ id: '', name: '', students: '', instructor: '' });
  };

  // --- LOGIC CHỈNH SỬA ---
  const handleEditClick = (topic) => {
    if (!isTeacher) return;
    setEditTopicId(topic.id);
    setEditFormData({ name: topic.name, students: topic.students, instructor: topic.instructor });
  };

  const handleSaveEdit = () => {
    setTopics(topics.map(t => t.id === editTopicId ? { ...t, ...editFormData } : t));
    setEditTopicId(null);
  };

  const handleDelete = (id) => {
    if (isTeacher && window.confirm("Xác nhận xóa đề tài này?")) {
      setTopics(topics.filter(t => t.id !== id));
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>DANH SÁCH ĐỀ TÀI THỰC TẬP</h2>
      
      <div style={actionRowStyle}>
        <div>
          <span>Học Kỳ: </span>
          <select style={selectStyle}>
            <option>HKI 2024-2025</option>
            <option>HKII 2024-2025</option>
          </select>
        </div>
        
        {isTeacher && (
          <button onClick={() => setIsAdding(true)} style={btnAddStyle}>+ Thêm đề tài mới</button>
        )}
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th style={thStyle}>Mã Đề Tài</th>
            <th style={thStyle}>Tên Đề Tài</th>
            <th style={thStyle}>Số Lượng SV</th>
            <th style={thStyle}>Giảng Viên</th>
            {isTeacher && <th style={thStyle}>Hành Động</th>}
          </tr>
        </thead>
        <tbody>
          {/* Row thêm mới */}
          {isAdding && (
            <tr style={formRowStyle}>
              <td style={tdStyle}><input type="text" name="id" placeholder="Mã..." value={newTopic.id} onChange={(e) => setNewTopic({...newTopic, id: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}><input type="text" name="name" placeholder="Tên..." value={newTopic.name} onChange={(e) => setNewTopic({...newTopic, name: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}><input type="text" name="students" placeholder="0/5" value={newTopic.students} onChange={(e) => setNewTopic({...newTopic, students: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}><input type="text" name="instructor" placeholder="GV..." value={newTopic.instructor} onChange={(e) => setNewTopic({...newTopic, instructor: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}>
                <button onClick={handleSaveNew} style={btnSaveStyle}>Lưu</button>
                <button onClick={() => setIsAdding(false)} style={btnCancelStyle}>Hủy</button>
              </td>
            </tr>
          )}

          {/* Danh sách đề tài */}
          {topics.map((topic) => (
            <tr key={topic.id} style={rowStyle}>
              {editTopicId === topic.id ? (
                <>
                  <td style={tdStyle}>{topic.id}</td>
                  <td style={tdStyle}><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} style={editInputStyle} /></td>
                  <td style={tdStyle}><input type="text" value={editFormData.students} onChange={(e) => setEditFormData({...editFormData, students: e.target.value})} style={editInputStyle} /></td>
                  <td style={tdStyle}><input type="text" value={editFormData.instructor} onChange={(e) => setEditFormData({...editFormData, instructor: e.target.value})} style={editInputStyle} /></td>
                  <td style={tdStyle}>
                    <button onClick={handleSaveEdit} style={btnSaveStyle}>Lưu</button>
                    <button onClick={() => setEditTopicId(null)} style={btnCancelStyle}>Hủy</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={tdStyle}>{topic.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{topic.name}</td>
                  <td style={tdStyle}>{topic.students}</td>
                  <td style={tdStyle}>{topic.instructor}</td>
                  {isTeacher && (
                    <td style={tdStyle}>
                      <button onClick={() => handleEditClick(topic)} style={btnEditStyle}>Sửa</button>
                      <button onClick={() => handleDelete(topic.id)} style={btnDeleteStyle}>Xóa</button>
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {!isTeacher && <p style={adminNoteStyle}>* Chế độ xem: Bạn không có quyền chỉnh sửa danh sách này.</p>}
    </div>
  );
}

// --- Styles ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const actionRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const selectStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' };
const btnAddStyle = { padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const formRowStyle = { background: '#f0fdf4' };

const inputStyle = { width: '90%', padding: '6px', border: '1px solid #22c55e', borderRadius: '4px', outline: 'none' };
const editInputStyle = { width: '90%', padding: '6px', border: '1px solid #3b82f6', borderRadius: '4px', outline: 'none' };
const btnEditStyle = { padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' };
const btnDeleteStyle = { padding: '6px 14px', background: '#f43f5e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnSaveStyle = { background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' };
const btnCancelStyle = { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };
const adminNoteStyle = { marginTop: '15px', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' };