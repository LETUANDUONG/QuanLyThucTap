import { useEffect, useMemo, useState } from 'react';
import { fetchRegistrationApprovals, updateRegistrationStatus } from '../lib/api';

export default function RegistrationApproval() {
  const currentUser = useMemo(() => JSON.parse(sessionStorage.getItem('currentUser') || '{}'), []);
  const teacherId = currentUser.profile?.id;
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchRegistrationApprovals();
      setRegistrations(data.map((registration) => ({
        id: registration.MaDangKy,
        studentCode: registration.MaSinhVien,
        studentName: registration.TenSinhVien,
        topicName: registration.TenDeTai,
        status: registration.TrangThai,
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const mutateStatus = async (id, status, reason = null) => {
    try {
      await updateRegistrationStatus(id, { status, reason, reviewerId: teacherId });
      await loadRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>DUYET YEU CAU DANG KY DE TAI</h2>

      <div style={headerActionsStyle}>
        <button onClick={loadRegistrations} style={btnRefreshStyle}>Lam moi</button>
      </div>

      {loading && <p style={messageStyle}>Dang tai du lieu...</p>}
      {error && <p style={errorStyle}>Khong tai duoc dang ky: {error}</p>}

      {!loading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderStyle}>
              <th style={thStyle}>Ma SV</th>
              <th style={thStyle}>Ten sinh vien</th>
              <th style={thStyle}>De tai dang ky</th>
              <th style={thStyle}>Trang thai</th>
              <th style={thStyle}>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id} style={rowStyle}>
                <td style={tdStyle}>{reg.studentCode}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{reg.studentName}</td>
                <td style={tdStyle}>{reg.topicName}</td>
                <td style={tdStyle}>
                  <span style={{ ...statusBadgeStyle, background: reg.status === 'PENDING' ? '#fef08a' : (reg.status === 'APPROVED' ? '#dcfce7' : '#fee2e2'), color: reg.status === 'PENDING' ? '#854d0e' : (reg.status === 'APPROVED' ? '#166534' : '#991b1b') }}>{reg.status}</span>
                </td>
                <td style={tdStyle}>
                  {reg.status === 'PENDING' ? (
                    <>
                      <button onClick={() => mutateStatus(reg.id, 'APPROVED')} style={btnApproveStyle}>Duyet</button>
                      <button onClick={() => {
                        const reason = window.prompt('Nhap ly do tu choi:');
                        if (reason) mutateStatus(reg.id, 'REJECTED', reason);
                      }} style={btnRejectStyle}>Tu choi</button>
                    </>
                  ) : (
                    <button onClick={() => mutateStatus(reg.id, 'PENDING')} style={btnUndoStyle}>Hoan tac</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const titleStyle = { margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const headerActionsStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' };
const messageStyle = { color: '#475569', marginBottom: '16px' };
const errorStyle = { color: '#b91c1c', marginBottom: '16px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const tableHeaderStyle = { background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' };
const thStyle = { padding: '12px' };
const tdStyle = { padding: '12px' };
const rowStyle = { borderBottom: '1px solid #e2e8f0' };
const statusBadgeStyle = { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };
const btnRefreshStyle = { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnApproveStyle = { padding: '6px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' };
const btnRejectStyle = { padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnUndoStyle = { padding: '6px 10px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' };
