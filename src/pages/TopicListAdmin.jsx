import { useEffect, useState } from 'react';
import { createTopic, deleteTopic, fetchSemesters, fetchTeachers, fetchTopics, updateTopic } from '../lib/api';

export default function TopicListAdmin() {
  const role = sessionStorage.getItem('userRole');
  const isTeacher = role === 'teacher';
  const [topics, setTopics] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editTopicId, setEditTopicId] = useState(null);
  const [newTopic, setNewTopic] = useState({ id: '', name: '', semesterId: '', teacherId: '', description: '', maxStudents: 1, status: 'OPEN' });
  const [editFormData, setEditFormData] = useState({ name: '', semesterId: '', teacherId: '', description: '', maxStudents: 1, status: 'OPEN' });

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const [topicData, semesterData, teacherData] = await Promise.all([
        fetchTopics(),
        fetchSemesters(),
        fetchTeachers(),
      ]);
      setTopics(topicData.map((topic) => ({
        id: topic.MaDeTai,
        name: topic.TenDeTai,
        description: topic.MoTa || '',
        maxStudents: topic.SoLuongToiDa,
        instructor: topic.TenGiangVien,
        teacherId: topic.MaGiangVien,
        semester: topic.TenHocKy,
        semesterId: topic.MaHocKy,
        status: topic.TrangThai,
      })));
      setSemesters(semesterData);
      setTeachers(teacherData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleCreate = async () => {
    try {
      await createTopic(newTopic);
      setIsAdding(false);
      setNewTopic({ id: '', name: '', semesterId: '', teacherId: '', description: '', maxStudents: 1, status: 'OPEN' });
      await loadTopics();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEdit = (topic) => {
    setEditTopicId(topic.id);
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
    if (!window.confirm('Xac nhan xoa de tai nay?')) return;
    try {
      await deleteTopic(id);
      await loadTopics();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>DANH SACH DE TAI THUC TAP</h2>

      <div style={actionRowStyle}>
        <button onClick={() => { setIsAdding(true); setEditTopicId(null); }} style={btnAddStyle}>+ Them de tai moi</button>
        <button onClick={loadTopics} style={btnRefreshStyle}>Lam moi</button>
      </div>

      {loading && <p style={infoStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc de tai: {error}</p>}

      {!loading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>Ma de tai</th>
              <th style={thStyle}>Ten de tai</th>
              <th style={thStyle}>Mo ta</th>
              <th style={thStyle}>SV toi da</th>
              <th style={thStyle}>Giang vien</th>
              <th style={thStyle}>Hoc ky</th>
              <th style={thStyle}>Trang thai</th>
              <th style={thStyle}>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={formRowStyle}>
                <td style={tdStyle}><input value={newTopic.id} onChange={(e) => setNewTopic({ ...newTopic, id: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}><input value={newTopic.name} onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}><textarea value={newTopic.description} onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })} style={textareaStyle} /></td>
                <td style={tdStyle}><input type="number" min="1" value={newTopic.maxStudents} onChange={(e) => setNewTopic({ ...newTopic, maxStudents: e.target.value })} style={inputStyle} /></td>
                <td style={tdStyle}>
                  <select value={newTopic.teacherId} onChange={(e) => setNewTopic({ ...newTopic, teacherId: e.target.value })} style={inputStyle}>
                    <option value="">Chon</option>
                    {teachers.map((teacher) => <option key={teacher.MaGiangVien} value={teacher.MaGiangVien}>{teacher.HoTen}</option>)}
                  </select>
                </td>
                <td style={tdStyle}>
                  <select value={newTopic.semesterId} onChange={(e) => setNewTopic({ ...newTopic, semesterId: e.target.value })} style={inputStyle}>
                    <option value="">Chon</option>
                    {semesters.map((semester) => <option key={semester.MaHocKy} value={semester.MaHocKy}>{semester.TenHocKy}</option>)}
                  </select>
                </td>
                <td style={tdStyle}>
                  <select value={newTopic.status} onChange={(e) => setNewTopic({ ...newTopic, status: e.target.value })} style={inputStyle}>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <button onClick={handleCreate} style={btnSaveStyle}>Luu</button>
                  <button onClick={() => setIsAdding(false)} style={btnCancelStyle}>Huy</button>
                </td>
              </tr>
            )}

            {topics.map((topic) => (
              <tr key={topic.id} style={rowStyle}>
                {editTopicId === topic.id ? (
                  <>
                    <td style={tdStyle}>{topic.id}</td>
                    <td style={tdStyle}><input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} style={inputStyle} /></td>
                    <td style={tdStyle}><textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} style={textareaStyle} /></td>
                    <td style={tdStyle}><input type="number" min="1" value={editFormData.maxStudents} onChange={(e) => setEditFormData({ ...editFormData, maxStudents: e.target.value })} style={inputStyle} /></td>
                    <td style={tdStyle}>
                      <select value={editFormData.teacherId} onChange={(e) => setEditFormData({ ...editFormData, teacherId: e.target.value })} style={inputStyle}>
                        <option value="">Chon</option>
                        {teachers.map((teacher) => <option key={teacher.MaGiangVien} value={teacher.MaGiangVien}>{teacher.HoTen}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select value={editFormData.semesterId} onChange={(e) => setEditFormData({ ...editFormData, semesterId: e.target.value })} style={inputStyle}>
                        <option value="">Chon</option>
                        {semesters.map((semester) => <option key={semester.MaHocKy} value={semester.MaHocKy}>{semester.TenHocKy}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} style={inputStyle}>
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={handleUpdate} style={btnSaveStyle}>Luu</button>
                      <button onClick={() => setEditTopicId(null)} style={btnCancelStyle}>Huy</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{topic.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{topic.name}</td>
                    <td style={tdStyle}>{topic.description || '--'}</td>
                    <td style={tdStyle}>{topic.maxStudents}</td>
                    <td style={tdStyle}>{topic.instructor}</td>
                    <td style={tdStyle}>{topic.semester}</td>
                    <td style={tdStyle}>
                      <span style={{ ...badgeStyle, background: topic.status === 'OPEN' ? '#dcfce7' : '#fee2e2', color: topic.status === 'OPEN' ? '#166534' : '#991b1b' }}>
                        {topic.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleStartEdit(topic)} style={btnEditStyle}>Sua</button>
                      <button onClick={() => handleDelete(topic.id)} style={btnDeleteStyle}>Xoa</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isTeacher && <p style={helperTextStyle}>Teacher hien da xem va quan ly day du giang vien huong dan, mo ta va trang thai de tai.</p>}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const actionRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const helperTextStyle = { marginTop: '15px', color: '#64748b', fontSize: '13px' };
const btnAddStyle = { padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnRefreshStyle = { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const infoStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#334155', verticalAlign: 'top' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const formRowStyle = { background: '#f0fdf4' };
const inputStyle = { width: '90%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' };
const textareaStyle = { width: '92%', minHeight: '72px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' };
const btnEditStyle = { padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' };
const btnDeleteStyle = { padding: '6px 14px', background: '#f43f5e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnSaveStyle = { background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' };
const btnCancelStyle = { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };
const badgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' };
