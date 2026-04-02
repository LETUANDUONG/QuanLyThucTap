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
      setReports(reportData.map((report) => ({
        id: report.MaBaoCao,
        name: report.TenBaoCao,
        deadline: String(report.HanNop).slice(0, 10),
        status: report.TrangThai,
        semester: report.TenHocKy,
        teacherId: report.MaNguoiTao || 'MY_SELF',
      })));
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
    if (!window.confirm(`Xac nhan xoa dot bao cao ${id}?`)) return;
    try {
      await deleteReport(id);
      await loadReports();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>DANH SACH BAO CAO TIEN DO</h2>
        <div style={headerActionsStyle}>
          {isTeacher && <button onClick={() => { setIsAdding(true); setEditId(null); }} style={btnAddStyle}>+ Them dot bao cao</button>}
          <button onClick={loadReports} style={btnRefreshStyle}>Lam moi</button>
        </div>
      </div>

      {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc bao cao: {error}</p>}

      {!loading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr style={theadRowStyle}>
              <th style={thStyle}>STT</th>
              <th style={thStyle}>Ma BC</th>
              <th style={thStyle}>Ten BC</th>
              <th style={thStyle}>Hoc ky</th>
              <th style={thStyle}>Han nop</th>
              <th style={thStyle}>Trang thai</th>
              <th style={thStyle}>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={formRowStyle}>
                <td style={tdStyle}>*</td>
                <td style={tdStyle}><input value={newReport.id} onChange={(e) => setNewReport({ ...newReport, id: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}><input value={newReport.name} onChange={(e) => setNewReport({ ...newReport, name: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}><select value={newReport.semesterId} onChange={(e) => setNewReport({ ...newReport, semesterId: e.target.value })} style={inputStyle}><option value="">Chon</option>{semesters.map((semester) => <option key={semester.MaHocKy} value={semester.MaHocKy}>{semester.TenHocKy}</option>)}</select></td>
                <td style={tdStyle}><input type="date" value={newReport.deadline} onChange={(e) => setNewReport({ ...newReport, deadline: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}>OPEN</td>
                <td style={tdStyle}>
                  <button onClick={handleCreate} style={btnSaveStyle}>Luu</button>
                  <button onClick={() => setIsAdding(false)} style={btnCancelStyle}>Huy</button>
                </td>
              </tr>
            )}

            {reports.map((report, index) => (
              <tr key={report.id} style={rowStyle}>
                {editId === report.id ? (
                  <>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{report.id}</td>
                    <td style={tdStyle}><input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={inputStyle} /></td>
                    <td style={tdStyle}><select value={editData.semesterId} onChange={(e) => setEditData({ ...editData, semesterId: e.target.value })} style={inputStyle}><option value="">Chon</option>{semesters.map((semester) => <option key={semester.MaHocKy} value={semester.MaHocKy}>{semester.TenHocKy}</option>)}</select></td>
                    <td style={tdStyle}><input type="date" value={editData.deadline} onChange={(e) => setEditData({ ...editData, deadline: e.target.value })} style={inputStyle} /></td>
                    <td style={tdStyle}>{report.status}</td>
                    <td style={tdStyle}>
                      <button onClick={handleUpdate} style={btnSaveStyle}>Luu</button>
                      <button onClick={() => setEditId(null)} style={btnCancelStyle}>Huy</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{report.id}</td>
                    <td style={tdStyle}>{report.name}</td>
                    <td style={tdStyle}>{report.semester}</td>
                    <td style={tdStyle}>{formatDate(report.deadline)}</td>
                    <td style={tdStyle}><span style={{ ...statusBadgeStyle, background: report.status === 'OPEN' ? '#dcfce7' : '#f1f5f9', color: report.status === 'OPEN' ? '#166534' : '#64748b' }}>{report.status}</span></td>
                    <td style={tdStyle}>
                      <button onClick={() => handleViewAction(report)} style={btnViewStyle}>Xem</button>
                      {isTeacher && (
                        <>
                          <button onClick={() => { setEditId(report.id); setEditData({ name: report.name, deadline: report.deadline, semesterId: '' }); }} style={btnEditStyle}>Sua</button>
                          <button onClick={() => handleDelete(report.id)} style={btnDeleteStyle}>Xoa</button>
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', gap: '12px' };
const headerActionsStyle = { display: 'flex', alignItems: 'center', gap: '12px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const btnAddStyle = { padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };
const btnRefreshStyle = { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
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
