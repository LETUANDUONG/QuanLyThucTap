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
    <div className="page-shell">
      <section className="page-card">
        <div className="page-header">
          <div>
            <button type="button" className="ghost-button" onClick={() => navigate('/bao-cao')}>
              Quay lai danh sach dot bao cao
            </button>
            <h1>Quan ly bao cao theo giang vien</h1>
          </div>
          <div className="page-actions">
            <button type="button" className="secondary-button" onClick={loadTeachers}>
              Lam moi
            </button>
          </div>
        </div>

        {loading && <div className="message-banner info">Dang tai du lieu...</div>}
        {error && <div className="message-banner error">Khong tai duoc giang vien: {error}</div>}

        {!loading && !error && (
          <div className="table-shell">
            <table className="data-table page-table-teacher">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>Ma GV</th>
                  <th>Ten giang vien</th>
                  <th>Bo mon</th>
                  <th>Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((gv) => (
                  <tr key={gv.id}>
                    <td>{gv.id}</td>
                    <td className="strong-cell">{gv.name}</td>
                    <td>{gv.department}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate(`/bao-cao/submissions/ALL/${gv.id}`)}
                      >
                        Xem danh sach lop
                      </button>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="muted-text">Khong tim thay du lieu giang vien.</td>
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
