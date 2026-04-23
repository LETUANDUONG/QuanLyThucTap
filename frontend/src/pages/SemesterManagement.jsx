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
    if (!window.confirm(`Xác nhận xóa học kỳ ${id}?`)) return;

    try {
      await deleteSemester(id);
      await loadSemesters();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Quản lý đợt thực tập</h1>
          <p>Tổ chức các kỳ thực tập theo dạng thẻ lớn, dễ nhìn và dễ thao tác hơn.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setIsAdding(true);
              setEditSemesterId(null);
            }}
          >
            + Tạo đợt
          </button>
          <button type="button" className="secondary-button" onClick={loadSemesters}>
            Làm mới
          </button>
        </div>
      </div>

      {loading && <div className="message-banner info">Đang tải dữ liệu học kỳ...</div>}
      {error && <div className="message-banner error">Không tải được học kỳ: {error}</div>}

      {!loading && !error && (
        <div className="semester-list">
          {isAdding && (
            <div className="semester-card">
              <div className="input-grid">
                <input
                  className="text-input"
                  placeholder="Mã học kỳ"
                  value={newSem.id}
                  onChange={(event) => setNewSem({ ...newSem, id: event.target.value })}
                />
                <input
                  className="text-input"
                  placeholder="Tên học kỳ"
                  value={newSem.name}
                  onChange={(event) => setNewSem({ ...newSem, name: event.target.value })}
                />
                <div className="field-inline">
                  <input
                    className="text-input"
                    type="date"
                    value={newSem.startDate}
                    onChange={(event) => setNewSem({ ...newSem, startDate: event.target.value })}
                  />
                  <input
                    className="text-input"
                    type="date"
                    value={newSem.endDate}
                    onChange={(event) => setNewSem({ ...newSem, endDate: event.target.value })}
                  />
                </div>
                <select
                  className="select-input"
                  value={newSem.status}
                  onChange={(event) => setNewSem({ ...newSem, status: event.target.value })}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <div className="button-row">
                  <button type="button" className="secondary-button" onClick={handleCreate}>
                    Lưu
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setIsAdding(false)}>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {semesters.map((sem) => (
            <div key={sem.id} className="semester-card">
              {editSemesterId === sem.id ? (
                <div className="input-grid">
                  <input
                    className="text-input"
                    value={editFormData.name}
                    onChange={(event) => setEditFormData({ ...editFormData, name: event.target.value })}
                  />
                  <div className="field-inline">
                    <input
                      className="text-input"
                      type="date"
                      value={editFormData.startDate}
                      onChange={(event) =>
                        setEditFormData({ ...editFormData, startDate: event.target.value })
                      }
                    />
                    <input
                      className="text-input"
                      type="date"
                      value={editFormData.endDate}
                      onChange={(event) => setEditFormData({ ...editFormData, endDate: event.target.value })}
                    />
                  </div>
                  <select
                    className="select-input"
                    value={editFormData.status}
                    onChange={(event) => setEditFormData({ ...editFormData, status: event.target.value })}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <div className="button-row">
                    <button type="button" className="secondary-button" onClick={handleUpdate}>
                      Lưu
                    </button>
                    <button type="button" className="secondary-button" onClick={() => setEditSemesterId(null)}>
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="semester-card-header">
                    <div>
                      <h3>{sem.name}</h3>
                      <p>
                        {formatDate(sem.startDate)} - {formatDate(sem.endDate)}
                      </p>
                    </div>
                    <span className={`badge ${sem.status === 'OPEN' ? 'success' : 'muted'}`}>
                      {sem.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                    </span>
                  </div>

                  <div className="card-actions" style={{ marginTop: '14px' }}>
                    <button type="button" className="secondary-button" onClick={() => handleEdit(sem)}>
                      {sem.status === 'OPEN' ? 'Đóng đợt' : 'Chỉnh sửa'}
                    </button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(sem.id)}>
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
