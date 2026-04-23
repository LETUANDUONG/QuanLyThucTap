import { useCallback, useEffect, useState } from 'react';
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

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchReportSubmissions();
      const filteredData = data.filter((submission) => {
        const matchReport = id === 'ALL' || submission.MaBaoCao === id;
        const matchTeacher =
          !teacherId ||
          teacherId === 'MY_SELF' ||
          teacherId === 'ALL' ||
          submission.MaGiangVienPhuTrach === teacherId;
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
  }, [id, teacherId]);

  useEffect(() => {
    if (role !== 'student') {
      loadSubmissions();
    }
  }, [loadSubmissions, role]);

  const handleBack = () => {
    role === 'admin' ? navigate('/bao-cao/teachers') : navigate('/bao-cao');
  };

  if (role === 'student') return null;

  return (
    <div className="page-shell">
      <section className="page-card">
        <div className="page-header">
          <div>
            <button type="button" className="ghost-button" onClick={handleBack}>
              {role === 'admin' ? 'Quay lai danh sach giang vien' : 'Quay lai danh sach dot bao cao'}
            </button>
            <h1>
              Danh sach bai nop - {id}
              {role === 'admin' && teacherId ? ` (GV: ${teacherId})` : ''}
            </h1>
          </div>

          <div className="page-actions">
            <button type="button" className="secondary-button" onClick={loadSubmissions}>
              Lam moi
            </button>
          </div>
        </div>

        {loading && <div className="message-banner info">Dang tai du lieu...</div>}
        {error && <div className="message-banner error">Khong tai duoc bai nop: {error}</div>}

        {!loading && !error && (
          <div className="table-shell">
            <table className="data-table page-table-report">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>Ma SV</th>
                  <th>Ten sinh vien</th>
                  <th>Ma bao cao</th>
                  <th>File nop</th>
                  <th>Trang thai</th>
                  <th>Diem</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={`${sub.reportId}-${sub.studentId}`}>
                    <td>{sub.studentId}</td>
                    <td className="strong-cell">{sub.studentName}</td>
                    <td>{sub.reportId}</td>
                    <td>
                      {sub.reportLink ? (
                        <div className="page-shell" style={{ gap: '4px' }}>
                          <div className="strong-cell">{sub.linkLabel || 'Google Docs'}</div>
                          <div className="muted-text">{sub.reportLink || '--'}</div>
                        </div>
                      ) : (
                        <span className="muted-text">Chua co link</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          sub.status === 'APPROVED'
                            ? 'approved'
                            : sub.status === 'NOT_SUBMITTED'
                              ? 'full'
                              : 'pending'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td>{sub.score !== null ? Number(sub.score).toFixed(1) : '--'}</td>
                    <td>
                      {sub.reportLink ? (
                        <div className="button-row">
                          <Link to={`/bao-cao/cham-diem/${sub.reportId}/${sub.studentId}`} className="secondary-button">
                            {role === 'teacher' ? 'Cham bai' : 'Xem bai'}
                          </Link>
                          <a href={sub.reportLink || '#'} target="_blank" rel="noreferrer" className="secondary-button">
                            Mo link
                          </a>
                        </div>
                      ) : (
                        <span className="muted-text">Chua co link</span>
                      )}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="muted-text">Khong co bai nop phu hop voi bo loc hien tai.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
