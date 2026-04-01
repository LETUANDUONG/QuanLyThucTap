import { useState } from 'react';

export default function TopicListStudent() {
  const [topics] = useState([
    { id: 'DT02', name: 'Nhận diện Email Phishing', major: 'Kỹ thuật phần mềm', instructor: 'Trần Thị B' },
    { id: 'DT04', name: 'Xây dựng Website React', major: 'Hệ thống thông tin', instructor: 'Lê Văn C' }
  ]);

  const [registeredTopicId, setRegisteredTopicId] = useState(null);

  // Xử lý Đăng ký / Hủy đăng ký
  const handleToggleRegister = (id) => {
    if (registeredTopicId === id) {
      if (window.confirm("Xác nhận HỦY đăng ký đề tài này?")) {
        setRegisteredTopicId(null);
      }
    } else {
      if (registeredTopicId !== null) {
        return alert("Lỗi: Bạn chỉ được đăng ký tối đa 1 đề tài!");
      }
      
      if (window.confirm("Xác nhận ĐĂNG KÝ đề tài này?")) {
        setRegisteredTopicId(id);
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <h2 style={titleStyle}>DANH SÁCH ĐỀ TÀI ĐĂNG KÝ</h2>
      </div>
      
      <div style={filterStyle}>
        <span>Học Kỳ: </span>
        <select style={selectStyle}>
          <option>HKI 2024-2025</option>
        </select>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>Mã Đề Tài</th>
            <th style={thStyle}>Tên Đề Tài</th>
            <th style={thStyle}>Chuyên Ngành</th>
            <th style={thStyle}>Giảng Viên</th>
            <th style={thStyle}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {topics.map(topic => {
            const isMyTopic = registeredTopicId === topic.id;
            const isDisabled = registeredTopicId !== null && !isMyTopic;

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
                      color: isDisabled ? '#64748b' : 'white', 
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isMyTopic ? 'Hủy đăng ký' : 'Đăng ký'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Styles ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const headerSectionStyle = { borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' };
const titleStyle = { margin: 0, fontSize: '18px', color: '#1e293b' };
const filterStyle = { marginBottom: '20px', fontSize: '14px' };
const selectStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadRowStyle = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#334155' };
const rowStyle = { borderBottom: '1px solid #f1f5f9', transition: 'background 0.3s' };

const btnBaseStyle = { 
  padding: '6px 16px', 
  border: 'none', 
  borderRadius: '4px', 
  fontWeight: 'bold', 
  fontSize: '13px',
  transition: '0.2s'
};