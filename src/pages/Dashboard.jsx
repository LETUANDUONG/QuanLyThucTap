import { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../lib/api';

const departmentColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const departments = summary?.departments || [];
  const studentCoverage = summary?.totalStudents
    ? Math.round((summary.studentsWithTopics / summary.totalStudents) * 100)
    : 0;

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>TONG QUAN HE THONG</h2>

      {loading && <p style={messageStyle}>Dang tai thong ke...</p>}
      {error && <p style={errorStyle}>Khong tai duoc thong ke: {error}</p>}

      {!loading && !error && summary && (
        <>
          <div style={cardGridStyle}>
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)' }}>
              <h3 style={cardLabelStyle}>Tong de tai</h3>
              <p style={cardValueStyle}>{summary.totalTopics}</p>
              <span style={cardSubtextStyle}>So lieu lay truc tiep tu bang DeTai</span>
            </div>

            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
              <h3 style={cardLabelStyle}>SV da co de tai</h3>
              <p style={cardValueStyle}>{summary.studentsWithTopics}/{summary.totalStudents}</p>
              <div style={progressContainerStyle}>
                <div style={{ ...progressBarStyle, width: `${studentCoverage}%`, background: '#fff' }} />
              </div>
            </div>

            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)' }}>
              <h3 style={cardLabelStyle}>Bao cao cho cham</h3>
              <p style={cardValueStyle}>{summary.reportsPendingReview}</p>
              <span style={cardSubtextStyle}>Trang thai SUBMITTED va REJECTED</span>
            </div>
          </div>

          <div style={detailGridStyle}>
            <div style={progressSectionStyle}>
              <h4 style={sectionTitleStyle}>Tien do theo bo mon</h4>
              {departments.map((item, idx) => (
                <div key={item.name} style={{ marginBottom: '18px' }}>
                  <div style={progressLabelRowStyle}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{item.percent}%</span>
                  </div>
                  <div style={progressMetaStyle}>De tai dang mo: {item.openTopics}/{item.totalTopics}</div>
                  <div style={trackStyle}>
                    <div style={{ ...thumbStyle, width: `${item.percent}%`, background: departmentColors[idx % departmentColors.length] }} />
                  </div>
                </div>
              ))}
              {departments.length === 0 && <p style={emptyStyle}>Chua co du lieu bo mon.</p>}
            </div>

            <div style={infoSectionStyle}>
              <h4 style={sectionTitleStyle}>Thong tin hoc ky</h4>
              <div style={infoItemStyle}>
                <span style={labelStyle}>Hoc ky hien tai</span>
                <p style={valueStyle}>{summary.currentSemester?.TenHocKy || '--'}</p>
              </div>
              <hr style={dividerStyle} />
              <div style={infoItemStyle}>
                <span style={labelStyle}>Trang thai dang ky</span>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ ...statusBadgeStyle, background: summary.currentSemester?.TrangThai === 'OPEN' ? '#dcfce7' : '#fee2e2', color: summary.currentSemester?.TrangThai === 'OPEN' ? '#166534' : '#991b1b' }}>
                    {summary.currentSemester?.TrangThai || '--'}
                  </span>
                </div>
              </div>
              <hr style={dividerStyle} />
              <div style={infoItemStyle}>
                <span style={labelStyle}>Tong sinh vien</span>
                <p style={valueStyle}>{summary.totalStudents}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const headerStyle = { margin: '0 0 25px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const cardGridStyle = { display: 'flex', gap: '20px', marginBottom: '30px' };
const cardStyle = { flex: 1, color: '#fff', padding: '20px', borderRadius: '14px', transition: 'transform 0.2s' };
const cardLabelStyle = { margin: 0, fontSize: '13px', opacity: 0.85, fontWeight: '500' };
const cardValueStyle = { fontSize: '32px', fontWeight: 'bold', margin: '12px 0' };
const cardSubtextStyle = { fontSize: '11px', opacity: 0.9 };
const progressContainerStyle = { height: '6px', background: 'rgba(255,255,255,0.25)', borderRadius: '3px', marginTop: '15px' };
const progressBarStyle = { height: '100%', borderRadius: '3px', transition: 'width 1s ease-in-out' };
const detailGridStyle = { display: 'flex', gap: '20px' };
const progressSectionStyle = { flex: 2, border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px', background: '#fff' };
const infoSectionStyle = { flex: 1, border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px', background: '#f8fafc' };
const sectionTitleStyle = { margin: '0 0 20px 0', fontSize: '15px', color: '#334155' };
const progressLabelRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#475569' };
const progressMetaStyle = { fontSize: '12px', color: '#64748b', marginBottom: '8px' };
const trackStyle = { height: '8px', background: '#f1f5f9', borderRadius: '10px' };
const thumbStyle = { height: '100%', borderRadius: '10px' };
const infoItemStyle = { marginBottom: '15px' };
const labelStyle = { fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' };
const valueStyle = { fontWeight: 'bold', color: '#1e293b', margin: 0, fontSize: '14px' };
const dividerStyle = { border: '0', borderTop: '1px solid #e2e8f0', margin: '15px 0' };
const statusBadgeStyle = { padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' };
const emptyStyle = { color: '#94a3b8', margin: 0 };
