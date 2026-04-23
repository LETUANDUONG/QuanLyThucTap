import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const loadSubmission = useCallback(async () => {
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
  }, [currentUser.profile?.id, id, role, studentId]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  const handleStudentSubmit = async () => {
    if (!reportLink.trim()) {
      alert('Bạn chưa nhập link báo cáo.');
      return;
    }

    try {
      await submitReport(id, {
        studentId: currentUser.profile?.id,
        reportLink: reportLink.trim(),
      });
      alert('Gửi link báo cáo thành công!');
      await loadSubmission();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTeacherSubmit = async () => {
    const numScore = parseFloat(score);
    if (!comment.trim() || Number.isNaN(numScore)) {
      alert('Vui lòng nhập đầy đủ nhận xét và điểm.');
      return;
    }
    if (numScore < 0 || numScore > 10) {
      alert('Điểm phải từ 0 đến 10.');
      return;
    }

    try {
      await gradeReport(id, studentId, {
        score: numScore,
        comment,
        graderId: currentUser.profile?.id,
      });
      alert('Chấm điểm thành công!');
      await loadSubmission();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-shell">
      <section className="page-card" style={{ maxWidth: '860px' }}>
        <div className="page-header">
          <div>
            <button type="button" className="ghost-button" onClick={() => navigate(-1)}>
              Quay lại
            </button>
            <h1>Chi tiết báo cáo {id ? `- ${id}` : ''}</h1>
          </div>
        </div>

        {loading && <div className="message-banner info">Đang tải dữ liệu...</div>}
        {error && <div className="message-banner error">Không tải được chi tiết bài nộp: {error}</div>}

        {!loading && (
          <>
            {role === 'student' && (
              <div className="compact-card">
                <p>Dán link Google Docs hoặc Google Drive để giảng viên mở trực tiếp.</p>
                <input
                  type="url"
                  placeholder="https://docs.google.com/..."
                  value={reportLink}
                  onChange={(event) => setReportLink(event.target.value)}
                  className="text-input"
                />
                <div className="button-row">
                  <button type="button" className="primary-button" onClick={handleStudentSubmit}>
                    Gửi link báo cáo
                  </button>
                </div>
              </div>
            )}

            <div className="compact-card">
              <strong>Link báo cáo:</strong>
              {submission?.DuongDanFile ? (
                <div className="page-shell" style={{ gap: '4px' }}>
                  <span className="strong-cell">{submission.TenFile || 'Google Docs'}</span>
                  <a href={submission.DuongDanFile} target="_blank" rel="noreferrer" className="secondary-button">
                    Mở link báo cáo
                  </a>
                </div>
              ) : (
                <span className="muted-text">Chưa có link nào</span>
              )}
            </div>

            {role === 'teacher' ? (
              <div className="compact-card">
                <h3>Đánh giá của giảng viên</h3>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Nhập phản hồi / nhận xét..."
                  className="text-area"
                />
                <div className="field-inline">
                  <div className="field">
                     <label>Điểm</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={score}
                      onChange={(event) => setScore(event.target.value)}
                      placeholder="/10"
                      className="text-input"
                    />
                  </div>
                  <div className="button-row">
                    <button type="button" className="primary-button" onClick={handleTeacherSubmit}>
                      Gửi đánh giá
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="compact-card">
                <h3>{role === 'admin' ? 'Xem đánh giá (Admin)' : 'Kết quả của bạn'}</h3>
                <p><strong>Nhận xét:</strong> {submission?.NhanXet || 'Chưa có nhận xét.'}</p>
                <p>
                  <strong>Điểm:</strong> {submission?.Diem !== undefined && submission?.Diem !== null ? Number(submission.Diem).toFixed(1) : '--'}/10
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
