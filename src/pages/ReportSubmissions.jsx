import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ReportSubmissions() {
  const { id, teacherId } = useParams(); 
  const role = sessionStorage.getItem('userRole');
  const navigate = useNavigate();

  // Bảo vệ route: Sinh viên không được phép vào trang này
  useEffect(() => {
    if (role === 'student') {
      navigate(`/bao-cao/chi-tiet/${id}`, { replace: true });
    }
  }, [role, id, navigate]);

  // Dữ liệu mẫu bài nộp
  const [submissions] = useState([
    { studentId: 'SV001', studentName: 'Nguyễn Văn A', topic: 'Nhận diện Email Phishing', file: 'SV001_Tuan1.pdf', status: 'Chờ chấm', score: null },
    { studentId: 'SV002', studentName: 'Trần Thị B', topic: 'Hệ thống Quản lý Sinh viên', file: null, status: 'Chưa nộp', score: null },
    { studentId: 'SV003', studentName: 'Lê Văn C', topic: 'Website TMĐT', file: 'SV003_Tuan1.pdf', status: 'Đã chấm', score: 8.5 },
  ]);

  // Xử lý quay lại theo vai trò
  const handleBack = () => {
    role === 'admin' ? navigate('/bao-cao/teachers') : navigate('/bao-cao');
  };

  if (role === 'student') return null;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <button onClick={handleBack} style={btnBackStyle}>
            {role === 'admin' ? '← Quay lại danh sách giảng viên' : '← Quay lại danh sách đợt báo cáo'}
          </button>
          
          <h2 style={titleStyle}>
            DANH SÁCH BÀI NỘP - {id} 
            {role === 'admin' && teacherId && <span style={teacherHighlight}> (GV: {teacherId})</span>}
          </h2>
        </div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th style={thStyle}>Mã SV</th>
            <th style={thStyle}>Tên Sinh Viên</th>
            <th style={thStyle}>Đề Tài</th>
            <th style={thStyle}>Trạng Thái</th>
            <th style={thStyle}>Điểm</th>
            <th style={thStyle}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.studentId} style={rowStyle}>
              <td style={tdStyle}>{sub.studentId}</td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sub.studentName}</td>
              <td style={tdStyle}>{sub.topic}</td>
              <td style={tdStyle}>
                <span style={{ 
                  ...statusBadgeStyle,
                  background: sub.status === 'Đã chấm' ? '#dcfce7' : sub.status === 'Chưa nộp' ? '#fee2e2' : '#fef9c3', 
                  color: sub.status === 'Đã chấm' ? '#166534' : sub.status === 'Chưa nộp' ? '#991b1b' : '#854d0e',
                }}>
                  {sub.status}
                </span>
              </td>
              <td style={scoreStyle}>
                {sub.score !== null ? sub.score : '--'}
              </td>
              <td style={tdStyle}>
                {sub.file ? (
                  <Link 
                    to={`/bao-cao/cham-diem/${id}/${sub.studentId}`} 
                    style={{ ...btnActionStyle, background: role === 'teacher' ? '#2563eb' : '#64748b' }}
                  >
                    {role === 'teacher' ? 'Chấm bài' : 'Xem bài'}
                  </Link>
                ) : (
                  <span style={noFileStyle}>Chưa có file</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Styles ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const teacherHighlight = { color: '#3b82f6', fontSize: '16px' };
const btnBackStyle = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', fontSize: '13px', padding: 0, fontWeight: '600' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };

const statusBadgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' };
const scoreStyle = { padding: '12px', fontWeight: 'bold', color: '#dc2626', fontSize: '15px' };
const btnActionStyle = { color: '#fff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' };
const noFileStyle = { color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' };