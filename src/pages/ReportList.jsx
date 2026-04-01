import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReportList() {
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole');
  const isTeacher = role === 'teacher';

  const [reports, setReports] = useState([
    { id: 'BC01', name: 'Báo cáo tuần 1', deadline: '2026-03-20', status: 'Đã duyệt' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newReport, setNewReport] = useState({ id: '', name: '', deadline: '' });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', deadline: '' });

  // Điều hướng phân luồng theo vai trò
  const handleViewAction = (reportId) => {
    switch (role) {
      case 'student':
        navigate(`/bao-cao/chi-tiet/${reportId}`);
        break;
      case 'admin':
        navigate(`/bao-cao/teachers`);
        break;
      default: // Giảng viên
        navigate(`/bao-cao/submissions/${reportId}/MY_SELF`);
        break;
    }
  };

  const handleSaveNew = () => {
    if (!newReport.id.trim() || !newReport.name.trim() || !newReport.deadline) {
      return alert("Lỗi: Vui lòng nhập đầy đủ thông tin!");
    }
    setReports([...reports, { ...newReport, status: 'Chưa nộp' }]);
    setIsAdding(false);
    setNewReport({ id: '', name: '', deadline: '' });
  };

  const handleEditClick = (report) => {
    setEditId(report.id);
    setEditData({ name: report.name, deadline: report.deadline });
  };

  const handleSaveEdit = () => {
    setReports(reports.map(r => r.id === editId ? { ...r, ...editData } : r));
    setEditId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Xác nhận xóa đợt báo cáo ${id}?`)) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>DANH SÁCH BÁO CÁO TIẾN ĐỘ</h2>
        {isTeacher && (
          <button onClick={() => setIsAdding(true)} style={btnAddStyle}>+ Thêm đợt báo cáo</button>
        )}
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={thStyle}>Mã BC</th>
            <th style={thStyle}>Tên BC</th>
            <th style={thStyle}>Hạn nộp</th>
            <th style={thStyle}>Trạng Thái</th>
            <th style={thStyle}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <tr style={formRowStyle}>
              <td style={tdStyle}>*</td>
              <td style={tdStyle}><input type="text" placeholder="BC02" value={newReport.id} onChange={(e) => setNewReport({...newReport, id: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}><input type="text" placeholder="Tên báo cáo..." value={newReport.name} onChange={(e) => setNewReport({...newReport, name: e.target.value})} style={inputStyle} /></td>
              <td style={tdStyle}><input type="date" value={newReport.deadline} onChange={(e) => setNewReport({...newReport, deadline: e.target.value})} style={inputStyle} /></td>
              <td style={{ ...tdStyle, color: '#64748b', fontWeight: 'bold' }}>Sắp mở</td>
              <td style={tdStyle}>
                <button onClick={handleSaveNew} style={btnSaveStyle}>Lưu</button>
                <button onClick={() => setIsAdding(false)} style={btnCancelStyle}>Hủy</button>
              </td>
            </tr>
          )}

          {reports.map((report, index) => (
            <tr key={report.id} style={rowStyle}>
              {editId === report.id ? (
                <>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{report.id}</td>
                  <td style={tdStyle}><input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} style={inputStyle} /></td>
                  <td style={tdStyle}><input type="date" value={editData.deadline} onChange={(e) => setEditData({...editData, deadline: e.target.value})} style={inputStyle} /></td>
                  <td style={tdStyle}>{report.status}</td>
                  <td style={tdStyle}>
                    <button onClick={handleSaveEdit} style={btnSaveStyle}>Xong</button>
                    <button onClick={() => setEditId(null)} style={btnCancelStyle}>Hủy</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{report.id}</td>
                  <td style={tdStyle}>{report.name}</td>
                  <td style={tdStyle}>{report.deadline}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      ...statusBadgeStyle,
                      background: report.status === 'Đã duyệt' ? '#dcfce7' : '#f1f5f9', 
                      color: report.status === 'Đã duyệt' ? '#166534' : '#64748b', 
                    }}>
                      {report.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleViewAction(report.id)} style={btnViewStyle}>Xem</button>
                    {isTeacher && (
                      <>
                        <button onClick={() => handleEditClick(report)} style={btnEditStyle}>Sửa</button>
                        <button onClick={() => handleDelete(report.id)} style={btnDeleteStyle}>Xóa</button>
                      </>
                    )}
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

// --- Styles ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const btnAddStyle = { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadRowStyle = { background: '#f8fafc', borderBottom: '2px solid #cbd5e1' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const formRowStyle = { background: '#f0fdf4' };

const inputStyle = { padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '90%' };
const statusBadgeStyle = { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' };

const btnSaveStyle = { background: '#22c55e', color: '#fff', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginRight: '5px' };
const btnCancelStyle = { background: '#cbd5e1', color: '#334155', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };
const btnViewStyle = { background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginRight: '5px' };
const btnEditStyle = { background: '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginRight: '5px' };
const btnDeleteStyle = { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };