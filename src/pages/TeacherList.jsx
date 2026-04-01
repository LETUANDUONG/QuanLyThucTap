import { useNavigate } from 'react-router-dom';

export default function TeacherList() {
  const navigate = useNavigate();

  // Dữ liệu mẫu giảng viên hướng dẫn
  const teachers = [
    { id: 'GV01', name: 'ThS. Nguyễn Văn A', department: 'CNTT', count: 15 },
    { id: 'GV02', name: 'TS. Trần Thị B', department: 'An toàn thông tin', count: 10 },
    { id: 'GV03', name: 'ThS. Lê Thị C', department: 'Hệ thống thông tin', count: 12 },
  ];

  return (
    <div style={containerStyle}>
      
      {/* Quay lại danh sách đợt báo cáo */}
      <div style={backBtnContainer}>
        <button onClick={() => navigate('/bao-cao')} style={btnBackStyle}>
          ← Quay lại danh sách đợt báo cáo
        </button>
      </div>

      <div style={headerStyle}>
        <h2 style={titleStyle}>QUẢN LÝ BÁO CÁO THEO GIẢNG VIÊN</h2>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th style={thStyle}>Mã GV</th>
            <th style={thStyle}>Tên Giảng Viên</th>
            <th style={thStyle}>Khoa / Bộ môn</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>Số SV hướng dẫn</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(gv => (
            <tr key={gv.id} style={rowStyle}>
              <td style={tdIdStyle}>{gv.id}</td>
              <td style={tdNameStyle}>{gv.name}</td>
              <td style={tdDeptStyle}>{gv.department}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                <span style={countBadgeStyle}>{gv.count}</span>
              </td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                <button 
                  onClick={() => navigate(`/bao-cao/submissions/ALL/${gv.id}`)}
                  style={btnViewStyle}
                >
                  Xem danh sách lớp
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {teachers.length === 0 && (
        <div style={emptyStateStyle}>Không tìm thấy dữ liệu giảng viên.</div>
      )}
    </div>
  );
}

// --- Hệ thống Styles ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const backBtnContainer = { marginBottom: '20px' };
const btnBackStyle = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' };

const headerStyle = { borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const subtitleStyle = { margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px' };
const tdIdStyle = { ...tdStyle, color: '#64748b', fontWeight: '500' };
const tdNameStyle = { ...tdStyle, fontWeight: 'bold', color: '#1e293b' };
const tdDeptStyle = { ...tdStyle, color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };

const countBadgeStyle = { background: '#f1f5f9', padding: '3px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#475569' };
const btnViewStyle = { background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
const emptyStateStyle = { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' };