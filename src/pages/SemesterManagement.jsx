import { useEffect, useState } from 'react';
import { createSemester, deleteSemester, fetchSemesters, updateSemester } from '../lib/api';

const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN');
};

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editSemesterId, setEditSemesterId] = useState(null);
  const [newSem, setNewSem] = useState({ id: '', name: '', startDate: '', endDate: '', status: 'CLOSED' });
  const [editFormData, setEditFormData] = useState({ name: '', startDate: '', endDate: '', status: 'CLOSED' });

  const loadSemesters = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchSemesters();
      setSemesters(
        data.map((semester) => ({
          id: semester.MaHocKy,
          name: semester.TenHocKy,
          startDate: String(semester.NgayBatDau).slice(0, 10),
          endDate: String(semester.NgayKetThuc).slice(0, 10),
          status: semester.TrangThai,
        })),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const handleCreate = async () => {
    try {
      await createSemester(newSem);
      setIsAdding(false);
      setNewSem({ id: '', name: '', startDate: '', endDate: '', status: 'CLOSED' });
      await loadSemesters();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (semester) => {
    setEditSemesterId(semester.id);
    setEditFormData({
      name: semester.name,
      startDate: semester.startDate,
      endDate: semester.endDate,
      status: semester.status,
    });
    setIsAdding(false);
  };

  const handleUpdate = async () => {
    try {
      await updateSemester(editSemesterId, editFormData);
      setEditSemesterId(null);
      await loadSemesters();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Xac nhan xoa hoc ky ${id}?`)) return;

    try {
      await deleteSemester(id);
      await loadSemesters();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>QUAN LY HOC KY</h2>

      <div style={toolbarStyle}>
        <button onClick={() => { setIsAdding(true); setEditSemesterId(null); }} style={btnPrimaryStyle}>+ Tao hoc ky</button>
        <button onClick={loadSemesters} style={btnRefreshStyle}>Lam moi</button>
      </div>

      {loading && <p style={infoTextStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorTextStyle}>Khong tai duoc hoc ky: {error}</p>}

      {!loading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr style={theadRowStyle}>
              <th style={thStyle}>Ma HK</th>
              <th style={thStyle}>Ten hoc ky</th>
              <th style={thStyle}>Thoi gian</th>
              <th style={thStyle}>Trang thai</th>
              <th style={thStyle}>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={formRowStyle}>
                <td style={tdStyle}><input value={newSem.id} onChange={(e) => setNewSem({ ...newSem, id: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}><input value={newSem.name} onChange={(e) => setNewSem({ ...newSem, name: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}>
                  <input type="date" value={newSem.startDate} onChange={(e) => setNewSem({ ...newSem, startDate: e.target.value })} style={inputStyle} />
                  <input type="date" value={newSem.endDate} onChange={(e) => setNewSem({ ...newSem, endDate: e.target.value })} style={{ ...inputStyle, marginTop: '6px' }} />
                </td>
                <td style={tdStyle}>
                  <select value={newSem.status} onChange={(e) => setNewSem({ ...newSem, status: e.target.value })} style={inputStyle}>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <button onClick={handleCreate} style={btnActionPrimaryStyle}>Luu</button>
                  <button onClick={() => setIsAdding(false)} style={btnActionSecondaryStyle}>Huy</button>
                </td>
              </tr>
            )}

            {semesters.map((sem) => (
              <tr key={sem.id} style={rowStyle}>
                {editSemesterId === sem.id ? (
                  <>
                    <td style={tdStyle}>{sem.id}</td>
                    <td style={tdStyle}><input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} style={inputStyle} /></td>
                    <td style={tdStyle}>
                      <input type="date" value={editFormData.startDate} onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })} style={inputStyle} />
                      <input type="date" value={editFormData.endDate} onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })} style={{ ...inputStyle, marginTop: '6px' }} />
                    </td>
                    <td style={tdStyle}>
                      <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} style={inputStyle}>
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={handleUpdate} style={btnActionPrimaryStyle}>Luu</button>
                      <button onClick={() => setEditSemesterId(null)} style={btnActionSecondaryStyle}>Huy</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{sem.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sem.name}</td>
                    <td style={tdStyle}>{formatDate(sem.startDate)} <br /> den {formatDate(sem.endDate)}</td>
                    <td style={tdStyle}>
                      <span style={{ ...badgeStyle, background: sem.status === 'OPEN' ? '#dcfce7' : '#fee2e2', color: sem.status === 'OPEN' ? '#166534' : '#991b1b' }}>
                        {sem.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(sem)} style={btnEditStyle}>Sua</button>
                      <button onClick={() => handleDelete(sem.id)} style={btnDeleteStyle}>Xoa</button>
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

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const headerStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const toolbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' };
const btnPrimaryStyle = { padding: '10px 18px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnRefreshStyle = { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const infoTextStyle = { color: '#475569', margin: '12px 0' };
const errorTextStyle = { color: '#b91c1c', margin: '12px 0' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadRowStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '15px 12px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' };
const tdStyle = { padding: '15px 12px', fontSize: '14px' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const formRowStyle = { background: '#f0fdf4' };
const inputStyle = { width: '90%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' };
const badgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' };
const btnActionPrimaryStyle = { background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnActionSecondaryStyle = { background: '#94a3b8', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' };
const btnEditStyle = { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' };
const btnDeleteStyle = { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
