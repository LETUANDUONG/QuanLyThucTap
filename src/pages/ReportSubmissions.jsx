import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchReportSubmissions } from '../lib/api';

export default function ReportSubmissions() {
  const { id, teacherId } = useParams();
  const role = sessionStorage.getItem('userRole');
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role === 'student') {
      navigate(`/bao-cao/chi-tiet/${id}`, { replace: true });
    }
  }, [role, id, navigate]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchReportSubmissions();
      const filteredData = data.filter((submission) => {
        const matchReport = id === 'ALL' || submission.MaBaoCao === id;
        const matchTeacher = !teacherId || teacherId === 'MY_SELF' || teacherId === 'ALL' || submission.MaGiangVienPhuTrach === teacherId;
        return matchReport && matchTeacher;
      });

      setSubmissions(
        filteredData.map((submission) => ({
          studentId: submission.MaSinhVien,
          studentName: submission.TenSinhVien,
          reportId: submission.MaBaoCao,
          linkLabel: submission.TenFile,
          reportLink: submission.DuongDanFile,
          status: submission.TrangThai,
          score: submission.Diem,
        })),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== 'student') {
      loadSubmissions();
    }
  }, [id, teacherId, role]);

  const handleBack = () => {
    role === 'admin' ? navigate('/bao-cao/teachers') : navigate('/bao-cao');
  };

  if (role === 'student') return null;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <button onClick={handleBack} style={btnBackStyle}>
            {role === 'admin' ? '← Quay lai danh sach giang vien' : '← Quay lai danh sach dot bao cao'}
          </button>

          <h2 style={titleStyle}>
            DANH SACH BAI NOP - {id}
            {role === 'admin' && teacherId && <span style={teacherHighlight}> (GV: {teacherId})</span>}
          </h2>
        </div>

        <button onClick={loadSubmissions} style={btnRefreshStyle}>Lam moi</button>
      </div>

      {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc bai nop: {error}</p>}

      {!loading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>Ma SV</th>
              <th style={thStyle}>Ten sinh vien</th>
              <th style={thStyle}>Ma bao cao</th>
              <th style={thStyle}>File nop</th>
              <th style={thStyle}>Trang thai</th>
              <th style={thStyle}>Diem</th>
              <th style={thStyle}>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={`${sub.reportId}-${sub.studentId}`} style={rowStyle}>
                <td style={tdStyle}>{sub.studentId}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sub.studentName}</td>
                <td style={tdStyle}>{sub.reportId}</td>
                <td style={tdStyle}>
                  {sub.reportLink ? (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{sub.linkLabel || 'Google Docs'}</div>
                      <div style={filePathStyle}>{sub.reportLink || '--'}</div>
                    </div>
                  ) : (
                    <span style={noFileStyle}>Chua co link</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      ...statusBadgeStyle,
                      background: sub.status === 'APPROVED' ? '#dcfce7' : sub.status === 'NOT_SUBMITTED' ? '#fee2e2' : '#fef9c3',
                      color: sub.status === 'APPROVED' ? '#166534' : sub.status === 'NOT_SUBMITTED' ? '#991b1b' : '#854d0e',
                    }}
                  >
                    {sub.status}
                  </span>
                </td>
                <td style={scoreStyle}>{sub.score !== null ? sub.score : '--'}</td>
                <td style={tdStyle}>
                  {sub.reportLink ? (
                    <>
                      <Link
                        to={`/bao-cao/cham-diem/${sub.reportId}/${sub.studentId}`}
                        style={{ ...btnActionStyle, background: role === 'teacher' ? '#2563eb' : '#64748b', marginRight: '6px' }}
                      >
                        {role === 'teacher' ? 'Cham bai' : 'Xem bai'}
                      </Link>
                      <a href={sub.reportLink || '#'} target="_blank" rel="noreferrer" style={{ ...btnActionStyle, background: '#0f766e' }}>
                        Mo link
                      </a>
                    </>
                  ) : (
                    <span style={noFileStyle}>Chua co link</span>
                  )}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="7" style={emptyCellStyle}>Khong co bai nop phu hop voi bo loc hien tai.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', gap: '12px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const teacherHighlight = { color: '#3b82f6', fontSize: '16px' };
const btnBackStyle = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', fontSize: '13px', padding: 0, fontWeight: '600' };
const btnRefreshStyle = { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#334155', verticalAlign: 'top' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const statusBadgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' };
const scoreStyle = { padding: '12px', fontWeight: 'bold', color: '#dc2626', fontSize: '15px' };
const btnActionStyle = { color: '#fff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' };
const noFileStyle = { color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' };
const filePathStyle = { fontSize: '12px', color: '#64748b', marginTop: '4px', wordBreak: 'break-all' };
const emptyCellStyle = { padding: '24px 12px', textAlign: 'center', color: '#94a3b8' };
