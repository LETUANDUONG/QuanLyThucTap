import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTeachers } from '../lib/api';

export default function TeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchTeachers();
      setTeachers(
        data.map((teacher) => ({
          id: teacher.MaGiangVien,
          name: teacher.HoTen,
          department: teacher.BoMon,
        })),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  return (
    <div style={containerStyle}>
      <div style={backBtnContainer}>
        <button onClick={() => navigate('/bao-cao')} style={btnBackStyle}>
          ← Quay lai danh sach dot bao cao
        </button>
      </div>

      <div style={headerStyle}>
        <h2 style={titleStyle}>QUAN LY BAO CAO THEO GIANG VIEN</h2>
        <button onClick={loadTeachers} style={btnRefreshStyle}>Lam moi</button>
      </div>

      {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc giang vien: {error}</p>}

      {!loading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>Ma GV</th>
              <th style={thStyle}>Ten giang vien</th>
              <th style={thStyle}>Bo mon</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((gv) => (
              <tr key={gv.id} style={rowStyle}>
                <td style={tdIdStyle}>{gv.id}</td>
                <td style={tdNameStyle}>{gv.name}</td>
                <td style={tdDeptStyle}>{gv.department}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => navigate(`/bao-cao/submissions/ALL/${gv.id}`)} style={btnViewStyle}>
                    Xem danh sach lop
                  </button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan="4" style={emptyStateStyle}>Khong tim thay du lieu giang vien.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const backBtnContainer = { marginBottom: '20px' };
const btnBackStyle = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 'bold' };
const headerStyle = { borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const btnRefreshStyle = { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px' };
const tdIdStyle = { ...tdStyle, color: '#64748b', fontWeight: '500' };
const tdNameStyle = { ...tdStyle, fontWeight: 'bold', color: '#1e293b' };
const tdDeptStyle = { ...tdStyle, color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const btnViewStyle = { background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
const emptyStateStyle = { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' };
