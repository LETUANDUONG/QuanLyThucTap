import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchReportSubmissions, gradeReport, submitReport } from '../lib/api';

export default function ReportDetail() {
  const { id, studentId } = useParams();
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole');
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const [reportLink, setReportLink] = useState('');
  const [comment, setComment] = useState('');
  const [score, setScore] = useState('');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchReportSubmissions();
      const targetStudentId = role === 'student' ? currentUser.profile?.id : studentId;
      const matched = data.find((item) => item.MaBaoCao === id && item.MaSinhVien === targetStudentId);
      setSubmission(matched || null);
      if (matched) {
        setComment(matched.NhanXet || '');
        setScore(matched.Diem ?? '');
        setReportLink(matched.DuongDanFile || '');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [id, studentId]);

  const handleStudentSubmit = async () => {
    if (!reportLink.trim()) {
      alert('Ban chua nhap link bao cao.');
      return;
    }

    try {
      await submitReport(id, {
        studentId: currentUser.profile?.id,
        reportLink: reportLink.trim(),
      });
      alert('Gui link bao cao thanh cong!');
      await loadSubmission();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTeacherSubmit = async () => {
    const numScore = parseFloat(score);
    if (!comment.trim() || Number.isNaN(numScore)) {
      alert('Vui long nhap day du nhan xet va diem.');
      return;
    }
    if (numScore < 0 || numScore > 10) {
      alert('Diem phai tu 0 den 10.');
      return;
    }

    try {
      await gradeReport(id, studentId, {
        score: numScore,
        comment,
        graderId: currentUser.profile?.id,
      });
      alert('Cham diem thanh cong!');
      await loadSubmission();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} style={btnBackStyle}>← Quay lai</button>
      </div>

      <div style={headerStyle}>
        <h2 style={titleStyle}>CHI TIET BAO CAO {id && `- ${id}`}</h2>
      </div>

      {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc chi tiet bai nop: {error}</p>}

      {!loading && (
        <>
          {role === 'student' && (
            <div style={linkSubmitBoxStyle}>
              <p style={{ color: '#64748b', margin: '0 0 12px 0' }}>Dan link Google Docs hoac Google Drive de giao vien mo truc tiep.</p>
              <input
                type="url"
                placeholder="https://docs.google.com/..."
                value={reportLink}
                onChange={(e) => setReportLink(e.target.value)}
                style={linkInputStyle}
              />
              <button onClick={handleStudentSubmit} style={{ ...btnSubmitStyle, marginTop: '16px' }}>Gui link bao cao</button>
            </div>
          )}

          <div style={attachmentBoxStyle}>
            <strong style={{ marginRight: '10px' }}>Link bao cao:</strong>
            {submission?.DuongDanFile ? (
              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{submission.TenFile || 'Google Docs'}</span>
                <a href={submission.DuongDanFile} target="_blank" rel="noreferrer" style={btnLinkStyle}>
                  Mo link bao cao
                </a>
              </div>
            ) : (
              <span style={{ color: '#94a3b8' }}>Chua co link nao</span>
            )}
          </div>

          {role === 'teacher' ? (
            <div style={reviewContainerStyle}>
              <h3 style={subTitleStyle}>Danh gia cua giang vien</h3>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhap phan hoi/ nhan xet..." style={textareaStyle} />
              <div style={submitRowStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <strong style={{ fontSize: '18px', marginRight: '10px' }}>Diem:</strong>
                  <input type="number" min="0" max="10" step="0.1" value={score} onChange={(e) => setScore(e.target.value)} placeholder="/10" style={inputScoreStyle} />
                </div>
                <button onClick={handleTeacherSubmit} style={btnSubmitStyle}>Gui danh gia</button>
              </div>
            </div>
          ) : (
            <div style={{ ...resultContainerStyle, background: role === 'admin' ? '#f8fafc' : '#f0fdf4' }}>
              <h3 style={subTitleStyle}>{role === 'admin' ? 'Xem danh gia (Admin)' : 'Ket qua cua ban'}</h3>
              <p><strong>Nhan xet:</strong> {submission?.NhanXet || 'Chua co nhan xet.'}</p>
              <p><strong>Diem: <span style={{ color: '#dc2626' }}>{submission?.Diem ?? '--'}</span>/10</strong></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '850px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const btnBackStyle = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 'bold' };
const headerStyle = { borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const linkSubmitBoxStyle = { padding: '24px', borderRadius: '12px', margin: '20px 0', background: '#f8fafc', border: '1px solid #e2e8f0' };
const linkInputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };
const attachmentBoxStyle = { padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '14px' };
const btnLinkStyle = { color: '#0f766e', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' };
const reviewContainerStyle = { background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const subTitleStyle = { margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#334155' };
const textareaStyle = { width: '100%', height: '100px', marginBottom: '15px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };
const submitRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const inputScoreStyle = { width: '80px', padding: '8px', fontSize: '16px', border: '2px solid #1e293b', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' };
const btnSubmitStyle = { background: '#1e293b', color: '#fff', padding: '10px 30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', border: 'none' };
const resultContainerStyle = { padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '14px' };
