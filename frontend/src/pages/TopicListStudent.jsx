import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRegistration, deleteRegistration, fetchRegistrations, fetchTopics } from '../lib/api';

function getInitials(name) {
  return String(name || 'SV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function TopicListStudent() {
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const studentId = currentUser.profile?.id;
  const studentName = currentUser.profile?.displayName || currentUser.username || 'Sinh viên';
  const [topics, setTopics] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [topicData, registrationData] = await Promise.all([fetchTopics(), fetchRegistrations()]);
      setTopics(
        topicData.map((topic) => {
          const localApprovedCount = registrationData.filter(
            (reg) => reg.MaDeTai === topic.MaDeTai && reg.TrangThai === 'APPROVED'
          ).length;
          const registeredCount = topic.SoLuongDaDuyet !== undefined ? topic.SoLuongDaDuyet : localApprovedCount;
          const maxStudents = topic.SoLuongToiDa || 1;

          return {
            id: topic.MaDeTai,
            name: topic.TenDeTai,
            semester: topic.TenHocKy,
            instructor: topic.TenGiangVien,
            status: topic.TrangThai,
            tags: topic.MoTa
              ? topic.MoTa.split(/,|;|\//).map((item) => item.trim()).filter(Boolean).slice(0, 3)
              : ['Thực tập', 'Đề tài'],
            slotsLeft: Math.max(0, maxStudents - registeredCount),
          };
        }),
      );

      const myRegistration = registrationData.find(
        (item) => item.MaSinhVien === studentId && item.TrangThai !== 'CANCELLED',
      );
      setRegistration(myRegistration || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const handleToggleRegister = async (id) => {
    try {
      if (registration?.MaDeTai === id) {
        if (!window.confirm('Xác nhận hủy đăng ký đề tài này?')) return;
        await deleteRegistration(registration.MaDangKy);
      } else {
        if (registration) {
          alert('Bạn đã có một đề tài đăng ký.');
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
    <div className="page-shell">
        <section className="page-shell">
          <div className="page-header">
            <div>
              <h1>Tìm đề tài</h1>
              <p>Hiển thị {topics.length} đề tài hiện có trong học kỳ.</p>
            </div>
            <div className="page-actions">
              <button type="button" className="secondary-button" onClick={loadTopics}>
                Làm mới
              </button>
            </div>
          </div>

          {loading && <div className="message-banner info">Đang tải dữ liệu...</div>}
          {error && <div className="message-banner error">Không tải được đề tài: {error}</div>}

          {!loading && !error && (
            <>
              <div className="topic-list">
                {topics.map((topic) => {
                  const isMyTopic = registration?.MaDeTai === topic.id;
                  const isDisabled = Boolean(registration) && !isMyTopic;
                  const isOpen = topic.status === 'OPEN';

                  return (
                    <article key={topic.id} className="topic-card">
                      <div className="topic-card-header">
                        <div>
                          <h3>{topic.name}</h3>
                          <p>
                            GV: {topic.instructor} • {topic.semester}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={isDisabled || !isOpen}
                          onClick={() => handleToggleRegister(topic.id)}
                          style={{
                            opacity: isDisabled || !isOpen ? 0.45 : 1,
                          }}
                        >
                          {isMyTopic ? 'Hủy đăng ký' : isOpen ? 'Đăng ký' : 'Hết slot'}
                        </button>
                      </div>

                      <div className="topic-tags">
                        {topic.tags.map((tag) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                        <span className={`badge ${isOpen ? 'success' : 'danger'}`}>
                          {isOpen ? `Còn ${topic.slotsLeft} slot` : 'Đã đầy'}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {registration && (
                <div className="compact-card">
                  <h3>Đăng ký đang chờ duyệt</h3>
                  <p>
                    Đề tài mã {registration.MaDeTai} đã được gửi và đang chờ giảng viên xử lý.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
    </div>
  );
}
