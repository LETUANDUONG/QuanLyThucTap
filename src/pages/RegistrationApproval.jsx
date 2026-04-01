import { useState } from 'react';

export default function RegistrationApproval() {
  const initialData = [
    { id: 'DK01', studentCode: 'SV001', studentName: 'Nguyễn Văn A', topicName: 'Nhận diện Email Phishing', status: 'PENDING' },
    { id: 'DK02', studentCode: 'SV002', studentName: 'Trần Thị B', topicName: 'Hệ thống Quản lý Sinh viên', status: 'PENDING' }
  ];

  const [registrations, setRegistrations] = useState(initialData);

  // --- LOGIC XỬ LÝ DUYỆT ---
  const updateStatus = (id, newStatus) => {
    setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg));
  };

  const handleApprove = (id) => updateStatus(id, 'APPROVED');

  const handleReject = (id) => {
    const reason = window.prompt("Nhập lý do TỪ CHỐI sinh viên này:");
    if (reason) updateStatus(id, 'REJECTED');
  };

  const handleUndo = (id) => updateStatus(id, 'PENDING');

  const handleApproveAll = () => {
    const hasPending = registrations.some(reg => reg.status === 'PENDING');
    if (!hasPending) return alert("Không có yêu cầu nào đang chờ duyệt!");

    if (window.confirm("Duyệt TẤT CẢ các yêu cầu đang chờ?")) {
      setRegistrations(prev => prev.map(reg => 
        reg.status === 'PENDING' ? { ...reg, status: 'APPROVED' } : reg
      ));
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>DUYỆT YÊU CẦU ĐĂNG KÝ ĐỀ TÀI</h2>
      
      <div style={headerActionsStyle}>
        <button onClick={() => setRegistrations(initialData)} style={btnRefreshStyle}>🔄 Làm mới</button>
        <button onClick={handleApproveAll} style={btnApproveAllStyle}>✅ Duyệt tất cả</button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={tableHeaderStyle}>
            <th style={thStyle}>Mã SV</th>
            <th style={thStyle}>Tên Sinh Viên</th>
            <th style={thStyle}>Đề Tài Đăng Ký</th>
            <th style={thStyle}>Trạng Thái</th>
            <th style={thStyle}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(reg => (
            <tr key={reg.id} style={rowStyle}>
              <td style={tdStyle}>{reg.studentCode}</td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>{reg.studentName}</td>
              <td style={tdStyle}>{reg.topicName}</td>
              <td style={tdStyle}>
                <span style={{ 
                  ...statusBadgeStyle,
                  background: reg.status === 'PENDING' ? '#fef08a' : (reg.status === 'APPROVED' ? '#dcfce7' : '#fee2e2'), 
                  color: reg.status === 'PENDING' ? '#854d0e' : (reg.status === 'APPROVED' ? '#166534' : '#991b1b'), 
                }}>
                  {reg.status === 'PENDING' ? 'CHỜ DUYỆT' : (reg.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI')}
                </span>
              </td>
              
              <td style={tdStyle}>
                {reg.status === 'PENDING' ? (
                  <>
                    <button onClick={() => handleApprove(reg.id)} style={btnApproveStyle}>Duyệt</button>
                    <button onClick={() => handleReject(reg.id)} style={btnRejectStyle}>Từ chối</button>
                  </>
                ) : (
                  <button onClick={() => handleUndo(reg.id)} style={btnUndoStyle}>↩ Hoàn tác</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const titleStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const headerActionsStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const tableHeaderStyle = { background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' };
const thStyle = { padding: '12px' };
const tdStyle = { padding: '12px' };
const rowStyle = { borderBottom: '1px solid #e2e8f0' };
const statusBadgeStyle = { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };

const btnRefreshStyle = { padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnApproveAllStyle = { padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnApproveStyle = { padding: '6px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' };
const btnRejectStyle = { padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnUndoStyle = { padding: '6px 10px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' };