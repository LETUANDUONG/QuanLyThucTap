import { useEffect, useMemo, useState } from 'react';
import {
  createTopic,
  deleteTopic,
  fetchRegistrationApprovals,
  fetchSemesters,
  fetchTeachers,
  fetchTopics,
  updateTopic,
} from '../lib/api';

function getInitials(name) {
  return String(name || 'GV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function TopicListAdmin() {
  const role = sessionStorage.getItem('userRole');
  const isTeacher = role === 'teacher';
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const [topics, setTopics] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editTopicId, setEditTopicId] = useState(null);
  const [newTopic, setNewTopic] = useState({
    id: '',
    name: '',
    semesterId: '',
    teacherId: '',
    description: '',
    maxStudents: 1,
    status: 'OPEN',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    semesterId: '',
    teacherId: '',
    description: '',
    maxStudents: 1,
    status: 'OPEN',
  });

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const [topicData, semesterData, teacherData, approvalData] = await Promise.all([
        fetchTopics(),
        fetchSemesters(),
        fetchTeachers(),
        fetchRegistrationApprovals().catch(() => []),
      ]);

      const mappedTopics = topicData.map((topic) => {
        const localApprovedCount = approvalData.filter(
          (reg) => reg.MaDeTai === topic.MaDeTai && reg.TrangThai === 'APPROVED'
        ).length;

        return {
          id: topic.MaDeTai,
          name: topic.TenDeTai,
          description: topic.MoTa || '',
          maxStudents: topic.SoLuongToiDa,
          instructor: topic.TenGiangVien,
          teacherId: topic.MaGiangVien,
          semester: topic.TenHocKy,
          semesterId: topic.MaHocKy,
          status: topic.TrangThai,
          registered: topic.SoLuongDaDuyet !== undefined ? topic.SoLuongDaDuyet : localApprovedCount,
        };
      });

      setTopics(mappedTopics);
      setSemesters(semesterData);
      setTeachers(teacherData);
      setPendingRegistrations(
        approvalData
          .filter((item) => item.TrangThai === 'PENDING')
          .map((item) => ({
            id: item.MaDangKy,
            studentName: item.TenSinhVien,
            studentCode: item.MaSinhVien,
            topicName: item.TenDeTai,
          })),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const resetNewTopic = () => {
    setNewTopic({
      id: '',
      name: '',
      semesterId: '',
      teacherId: '',
      description: '',
      maxStudents: 1,
      status: 'OPEN',
    });
  };

  const handleCreate = async () => {
    try {
      await createTopic(newTopic);
      setIsAdding(false);
      resetNewTopic();
      await loadTopics();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEdit = (topic) => {
    setEditTopicId(topic.id);
    setIsAdding(false);
    setEditFormData({
      name: topic.name,
      semesterId: topic.semesterId,
      teacherId: topic.teacherId,
      description: topic.description,
      maxStudents: topic.maxStudents,
      status: topic.status,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateTopic(editTopicId, editFormData);
      setEditTopicId(null);
      await loadTopics();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa đề tài này?')) return;

    try {
      await deleteTopic(id);
      await loadTopics();
    } catch (err) {
      alert(err.message);
    }
  };

  const teacherName =
    currentUser.profile?.displayName || currentUser.username || currentUser.profile?.id || 'Giảng viên';
  const approvalRate = topics.length
    ? Math.round((topics.filter((topic) => topic.status === 'OPEN').length / topics.length) * 100)
    : 0;

  return (
    <div className="page-shell">
        <section className="page-shell">
          <div className="page-header">
            <div>
              <h1>{isTeacher ? 'Danh sách đề tài' : 'Kho đề tài thực tập'}</h1>
            </div>
            <div className="page-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setIsAdding(true);
                  setEditTopicId(null);
                }}
              >
                + Tạo đề tài
              </button>
            </div>
          </div>

          {loading && <div className="message-banner info">Đang tải dữ liệu đề tài...</div>}
          {error && <div className="message-banner error">Không tải được đề tài: {error}</div>}

          {!loading && !error && (
            <>
              <div className="topic-list">
                {isAdding && (
                  <div className="topic-card">
                    <div className="input-grid">
                      <input
                        className="text-input"
                        placeholder="Mã đề tài"
                        value={newTopic.id}
                        onChange={(event) => setNewTopic({ ...newTopic, id: event.target.value })}
                      />
                      <input
                        className="text-input"
                        placeholder="Tên đề tài"
                        value={newTopic.name}
                        onChange={(event) => setNewTopic({ ...newTopic, name: event.target.value })}
                      />
                      <textarea
                        className="text-area"
                        placeholder="Mô tả"
                        value={newTopic.description}
                        onChange={(event) => setNewTopic({ ...newTopic, description: event.target.value })}
                      />
                      <div className="field-inline">
                        <select
                          className="select-input"
                          value={newTopic.teacherId}
                          onChange={(event) => setNewTopic({ ...newTopic, teacherId: event.target.value })}
                        >
                          <option value="">Chọn giảng viên</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.MaGiangVien} value={teacher.MaGiangVien}>
                              {teacher.HoTen}
                            </option>
                          ))}
                        </select>
                        <select
                          className="select-input"
                          value={newTopic.semesterId}
                          onChange={(event) => setNewTopic({ ...newTopic, semesterId: event.target.value })}
                        >
                          <option value="">Chọn học kỳ</option>
                          {semesters.map((semester) => (
                            <option key={semester.MaHocKy} value={semester.MaHocKy}>
                              {semester.TenHocKy}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="field-inline">
                        <input
                          className="text-input"
                          type="number"
                          min="1"
                          placeholder="Số lượng tối đa"
                          value={newTopic.maxStudents}
                          onChange={(event) =>
                            setNewTopic({ ...newTopic, maxStudents: Number(event.target.value) })
                          }
                        />
                        <select
                          className="select-input"
                          value={newTopic.status}
                          onChange={(event) => setNewTopic({ ...newTopic, status: event.target.value })}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </div>
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

                {topics.map((topic) => (
                  <article key={topic.id} className="topic-card">
                    {editTopicId === topic.id ? (
                      <div className="input-grid">
                        <input
                          className="text-input"
                          value={editFormData.name}
                          onChange={(event) => setEditFormData({ ...editFormData, name: event.target.value })}
                        />
                        <textarea
                          className="text-area"
                          value={editFormData.description}
                          onChange={(event) =>
                            setEditFormData({ ...editFormData, description: event.target.value })
                          }
                        />
                        <div className="field-inline">
                          <select
                            className="select-input"
                            value={editFormData.teacherId}
                            onChange={(event) =>
                              setEditFormData({ ...editFormData, teacherId: event.target.value })
                            }
                          >
                            <option value="">Chọn giảng viên</option>
                            {teachers.map((teacher) => (
                              <option key={teacher.MaGiangVien} value={teacher.MaGiangVien}>
                                {teacher.HoTen}
                              </option>
                            ))}
                          </select>
                          <select
                            className="select-input"
                            value={editFormData.semesterId}
                            onChange={(event) =>
                              setEditFormData({ ...editFormData, semesterId: event.target.value })
                            }
                          >
                            <option value="">Chọn học kỳ</option>
                            {semesters.map((semester) => (
                              <option key={semester.MaHocKy} value={semester.MaHocKy}>
                                {semester.TenHocKy}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field-inline">
                          <input
                            className="text-input"
                            type="number"
                            min="1"
                            value={editFormData.maxStudents}
                            onChange={(event) =>
                              setEditFormData({
                                ...editFormData,
                                maxStudents: Number(event.target.value),
                              })
                            }
                          />
                          <select
                            className="select-input"
                            value={editFormData.status}
                            onChange={(event) =>
                              setEditFormData({ ...editFormData, status: event.target.value })
                            }
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                        <div className="button-row">
                          <button type="button" className="secondary-button" onClick={handleUpdate}>
                            Lưu
                          </button>
                          <button type="button" className="secondary-button" onClick={() => setEditTopicId(null)}>
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="topic-card-header">
                          <div>
                            <h3>{topic.name}</h3>
                            <p>{topic.instructor} • {topic.semester}</p>
                          </div>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleStartEdit(topic)}
                          >
                            Sửa
                          </button>
                        </div>

                        <div className="topic-tags">
                          <span className={`badge ${topic.status === 'OPEN' ? 'success' : 'muted'}`}>
                            {topic.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                          </span>
                          <span className="tag">Đã đăng ký: {topic.registered}/{topic.maxStudents}</span>
                        </div>

                        <div className="track" style={{ marginTop: '10px' }}>
                          <div
                            className="thumb progress-2"
                            style={{
                              width: `${Math.max(0, Math.min(100, Math.round((topic.registered / topic.maxStudents) * 100)))}%`,
                            }}
                          />
                        </div>

                        <p style={{ marginTop: '10px' }}>{topic.description || 'Chưa có mô tả chi tiết.'}</p>

                        <div className="topic-card-footer" style={{ marginTop: '14px' }}>
                          <span className="muted-text">Mã đề tài: {topic.id}</span>
                          <div className="button-row">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => handleDelete(topic.id)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>

              <div className="compact-card">
                <h3>Sinh viên chờ duyệt</h3>
                <table className="mini-table" style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      <th>MSSV</th>
                      <th>Đề tài</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRegistrations.length > 0 ? (
                      pendingRegistrations.slice(0, 4).map((item) => (
                        <tr key={item.id}>
                          <td>{item.studentName}</td>
                          <td>{item.studentCode}</td>
                          <td>{item.topicName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="muted-text">Chưa có đăng ký chờ duyệt.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="compact-card">
                <h3>Tỷ lệ đề tài đang mở</h3>
                <div className="track" style={{ marginTop: '14px' }}>
                  <div className="thumb progress-2" style={{ width: `${approvalRate}%` }} />
                </div>
                <div className="inline-spread" style={{ marginTop: '10px' }}>
                  <p>Mức sẵn sàng tiếp nhận đăng ký</p>
                  <strong>{approvalRate}%</strong>
                </div>
              </div>
            </>
          )}
        </section>
    </div>
  );
}
