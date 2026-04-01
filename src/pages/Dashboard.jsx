import { useState } from 'react';

export default function Dashboard() {
  const role = sessionStorage.getItem('userRole');

  // Dữ liệu thống kê theo khoa
  const departmentProgress = [
    { name: 'Kỹ thuật phần mềm', percent: 85, color: '#3b82f6' },
    { name: 'Hệ thống thông tin', percent: 70, color: '#10b981' },
    { name: 'An toàn thông tin', percent: 45, color: '#f59e0b' },
    { name: 'Mạng máy tính', percent: 60, color: '#6366f1' },
  ];

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>TỔNG QUAN HỆ THỐNG</h2>
      
      {/* Thẻ chỉ số (KPI Cards) */}
      <div style={cardGridStyle}>
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)' }}>
          <h3 style={cardLabelStyle}>Tổng đề tài</h3>
          <p style={cardValueStyle}>48</p>
          <span style={cardSubtextStyle}>↑ 12% so với kỳ trước</span>
        </div>

        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
          <h3 style={cardLabelStyle}>SV đã có đề tài</h3>
          <p style={cardValueStyle}>156/180</p>
          <div style={progressContainerStyle}>
            <div style={{ ...progressBarStyle, width: '86%', background: '#fff' }}></div>
          </div>
        </div>

        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)' }}>
          <h3 style={cardLabelStyle}>Báo cáo chờ chấm</h3>
          <p style={cardValueStyle}>09</p>
          <span style={cardSubtextStyle}>Cần hoàn thành trong hôm nay</span>
        </div>
      </div>

      {/* Chi tiết tiến độ & Thông tin học kỳ */}
      <div style={detailGridStyle}>
        <div style={progressSectionStyle}>
          <h4 style={sectionTitleStyle}>Tiến độ thực hiện theo khoa</h4>
          {departmentProgress.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '18px' }}>
              <div style={progressLabelRowStyle}>
                <span>{item.name}</span>
                <span style={{ fontWeight: 'bold' }}>{item.percent}%</span>
              </div>
              <div style={trackStyle}>
                <div style={{ ...thumbStyle, width: `${item.percent}%`, background: item.color }}></div>
              </div>
            </div>
          ))}
        </div>

        <div style={infoSectionStyle}>
          <h4 style={sectionTitleStyle}>Thông tin học kỳ</h4>
          <div style={infoItemStyle}>
            <span style={labelStyle}>Học kỳ hiện tại:</span>
            <p style={valueStyle}>Học kỳ I (2024-2025)</p>
          </div>
          <hr style={dividerStyle} />
          <div style={infoItemStyle}>
            <span style={labelStyle}>Trạng thái đăng ký:</span>
            <div style={{ marginTop: '8px' }}>
              <span style={statusBadgeStyle}>ĐANG MỞ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Hệ thống Styles ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const headerStyle = { margin: '0 0 25px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' };
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

const progressLabelRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#475569' };
const trackStyle = { height: '8px', background: '#f1f5f9', borderRadius: '10px' };
const thumbStyle = { height: '100%', borderRadius: '10px' };

const infoItemStyle = { marginBottom: '15px' };
const labelStyle = { fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' };
const valueStyle = { fontWeight: 'bold', color: '#1e293b', margin: 0, fontSize: '14px' };
const dividerStyle = { border: '0', borderTop: '1px solid #e2e8f0', margin: '15px 0' };
const statusBadgeStyle = { padding: '5px 14px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' };