import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport, deleteReport, fetchReports, fetchSemesters, updateReport } from '../lib/api';

const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN');
};

export default function ReportList() {
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole');
  const isTeacher = role === 'teacher';
  const [reports, setReports] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newReport, setNewReport] = useState({ id: '', name: '', deadline: '', semesterId: '' });
  const [editData, setEditData] = useState({ name: '', deadline: '', semesterId: '' });

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const [reportData, semesterData] = await Promise.all([fetchReports(), fetchSemesters()]);
      setReports(
        reportData.map((report) => ({
          id: report.MaBaoCao,
          name: report.TenBaoCao,
          deadline: String(report.HanNop).slice(0, 10),
          status: report.TrangThai,
          semester: report.TenHocKy,
          semesterId: report.MaHocKy,
          teacherId: report.MaNguoiTao || 'MY_SELF',
        })),
      );
      setSemesters(semesterData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleViewAction = (report) => {
    switch (role) {
      case 'student':
        navigate(`/bao-cao/chi-tiet/${report.id}`);
        break;
      case 'admin':
        navigate('/bao-cao/teachers');
        break;
      default:
        navigate(`/bao-cao/submissions/${report.id}/${currentUser.profile?.id || report.teacherId}`);
        break;
    }
  };

  const handleCreate = async () => {
    try {
      await createReport({
        ...newReport,
        createdBy: currentUser.profile?.id,
        status: 'OPEN',
      });
      setIsAdding(false);
      setNewReport({ id: '', name: '', deadline: '', semesterId: '' });
      await loadReports();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateReport(editId, editData);
      setEditId(null);
      await loadReports();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Xác nhận xóa đợt báo cáo ${id}?`)) return;

    try {
      await deleteReport(id);
      await loadReports();
    } catch (err) {
      alert(err.message);
    }
  };

  const openReports = Math.round(reports.filter((report) => report.status === 'OPEN').length);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Báo cáo</p>
          <h1>Danh sách báo cáo tiến độ</h1>
          <p>Giao diện được tổ chức lại để phân biệt rõ đợt báo cáo, hạn nộp và luồng xử lý theo vai trò.</p>
        </div>
        <div className="page-actions">
          {isTeacher && (
            <button
              type="button"
              className="success-button"
              onClick={() => {
                setIsAdding(true);
                setEditId(null);
              }}
            >
              Thêm đợt báo cáo
            </button>
          )}
          <button type="button" className="secondary-button" onClick={loadReports}>
            Làm mới
          </button>
        </div>
      </div>

      <section className="status-strip">
        <article className="stat-card surface-card inset">
          <strong>{Math.round(reports.length)}</strong>
          <p>Tổng đợt báo cáo</p>
        </article>
        <article className="stat-card surface-card inset">
          <strong>{openReports}</strong>
          <p>Đợt báo cáo đang mở</p>
        </article>
        <article className="stat-card surface-card inset">
          <strong>{Math.round(reports.length - openReports)}</strong>
          <p>Đợt báo cáo đã đóng</p>
        </article>
      </section>

      {loading && <div className="message-banner info">Đang tải dữ liệu báo cáo...</div>}
      {error && <div className="message-banner error">Không tải được báo cáo: {error}</div>}

      {!loading && !error && (
        <section className="surface-card section-card">
          <div className="section-header">
            <div>
              <h3>Lịch báo cáo</h3>
              <p className="section-subtitle">Theo dõi hạn nộp, học kỳ và thao tác nhanh đến trang chấm hoặc xem chi tiết.</p>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table page-table-generic-7">
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
                  <th>STT</th>
                  <th>Mã báo cáo</th>
                  <th>Tên báo cáo</th>
                  <th>Học kỳ</th>
                  <th>Hạn nộp</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr className="form-row">
                    <td>*</td>
                    <td>
                      <input
                        className="text-input"
                        value={newReport.id}
                        onChange={(event) => setNewReport({ ...newReport, id: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="text-input"
                        value={newReport.name}
                        onChange={(event) => setNewReport({ ...newReport, name: event.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        className="select-input"
                        value={newReport.semesterId}
                        onChange={(event) => setNewReport({ ...newReport, semesterId: event.target.value })}
                      >
                        <option value="">Chọn học kỳ</option>
                        {semesters.map((semester) => (
                          <option key={semester.MaHocKy} value={semester.MaHocKy}>
                            {semester.TenHocKy}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        className="text-input"
                        value={newReport.deadline}
                        onChange={(event) => setNewReport({ ...newReport, deadline: event.target.value })}
                      />
                    </td>
                    <td>
                      <span className="badge success">OPEN</span>
                    </td>
                    <td>
                      <div className="button-row">
                        <button type="button" className="success-button" onClick={handleCreate}>
                          Lưu
                        </button>
                        <button type="button" className="secondary-button" onClick={() => setIsAdding(false)}>
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {reports.map((report, index) => (
                  <tr key={report.id}>
                    {editId === report.id ? (
                      <>
                        <td>{index + 1}</td>
                        <td className="strong-cell">{report.id}</td>
                        <td>
                          <input
                            className="text-input"
                            value={editData.name}
                            onChange={(event) => setEditData({ ...editData, name: event.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            className="select-input"
                            value={editData.semesterId}
                            onChange={(event) => setEditData({ ...editData, semesterId: event.target.value })}
                          >
                            <option value="">Chọn học kỳ</option>
                            {semesters.map((semester) => (
                              <option key={semester.MaHocKy} value={semester.MaHocKy}>
                                {semester.TenHocKy}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="text-input"
                            value={editData.deadline}
                            onChange={(event) => setEditData({ ...editData, deadline: event.target.value })}
                          />
                        </td>
                        <td>
                          <span className={`badge ${report.status === 'OPEN' ? 'success' : 'muted'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          <div className="button-row">
                            <button type="button" className="success-button" onClick={handleUpdate}>
                              Lưu
                            </button>
                            <button type="button" className="secondary-button" onClick={() => setEditId(null)}>
                              Hủy
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{index + 1}</td>
                        <td className="strong-cell">{report.id}</td>
                        <td>{report.name}</td>
                        <td>{report.semester}</td>
                        <td>{formatDate(report.deadline)}</td>
                        <td>
                          <span className={`badge ${report.status === 'OPEN' ? 'success' : 'muted'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          <div className="button-row">
                            <button type="button" className="primary-button" onClick={() => handleViewAction(report)}>
                              Xem
                            </button>
                            {isTeacher && (
                              <>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => {
                                    setEditId(report.id);
                                    setEditData({
                                      name: report.name,
                                      deadline: report.deadline,
                                      semesterId: report.semesterId || '',
                                    });
                                  }}
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  className="danger-button"
                                  onClick={() => handleDelete(report.id)}
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
