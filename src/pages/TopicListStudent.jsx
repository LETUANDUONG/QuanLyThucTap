import { useEffect, useMemo, useState } from 'react';
import { createRegistration, deleteRegistration, fetchRegistrations, fetchTopics } from '../lib/api';

export default function TopicListStudent() {
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const studentId = currentUser.profile?.id;
  const [topics, setTopics] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const [topicData, registrationData] = await Promise.all([fetchTopics(), fetchRegistrations()]);
      setTopics(topicData.map((topic) => ({
        id: topic.MaDeTai,
        name: topic.TenDeTai,
        major: topic.TenHocKy,
        instructor: topic.TenGiangVien,
      })));
      const myRegistration = registrationData.find((item) => item.MaSinhVien === studentId && item.TrangThai !== 'CANCELLED');
      setRegistration(myRegistration || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleToggleRegister = async (id) => {
    try {
      if (registration?.MaDeTai === id) {
        if (!window.confirm('Xac nhan HUY dang ky de tai nay?')) return;
        await deleteRegistration(registration.MaDangKy);
      } else {
        if (registration) {
          alert('Ban da co mot de tai dang ky.');
          return;
        }
        await createRegistration({ studentId, topicId: id });
      }
      await loadTopics();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <h2 style={titleStyle}>DANH SACH DE TAI DANG KY</h2>
      </div>

      <div style={filterStyle}>
        <button onClick={loadTopics} style={btnRefreshStyle}>Lam moi</button>
        <span style={helperTextStyle}>Mỗi sinh vien chi dang ky 1 de tai.</span>
      </div>

      {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc de tai: {error}</p>}

      {!loading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr style={theadRowStyle}>
              <th style={thStyle}>Ma de tai</th>
              <th style={thStyle}>Ten de tai</th>
              <th style={thStyle}>Hoc ky</th>
              <th style={thStyle}>Giang vien</th>
              <th style={thStyle}>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => {
              const isMyTopic = registration?.MaDeTai === topic.id;
              const isDisabled = Boolean(registration) && !isMyTopic;

              return (
                <tr key={topic.id} style={{ ...rowStyle, background: isMyTopic ? '#f0fdf4' : 'transparent' }}>
                  <td style={tdStyle}>{topic.id}</td>
                  <td style={{ ...tdStyle, fontWeight: isMyTopic ? 'bold' : 'normal' }}>{topic.name}</td>
                  <td style={tdStyle}>{topic.major}</td>
                  <td style={tdStyle}>{topic.instructor}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleToggleRegister(topic.id)}
                      disabled={isDisabled}
                      style={{
                        ...btnBaseStyle,
                        background: isMyTopic ? '#ef4444' : (isDisabled ? '#cbd5e1' : '#3b82f6'),
                        color: isDisabled ? '#64748b' : '#fff',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isMyTopic ? 'Huy dang ky' : 'Dang ky'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerSectionStyle = { borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' };
const titleStyle = { margin: 0, fontSize: '18px', color: '#1e293b' };
const filterStyle = { marginBottom: '20px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' };
const btnRefreshStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' };
const helperTextStyle = { color: '#64748b', fontSize: '13px' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadRowStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9', transition: 'background 0.3s' };
const btnBaseStyle = { padding: '6px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' };
