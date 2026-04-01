import { useState } from 'react';

export default function NotificationManagement() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipient: 'all'
  });

  const [isSending, setIsSending] = useState(false);

  // Cập nhật giá trị input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý gửi thông báo
  const handleSend = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      return alert("Vui lòng nhập đầy đủ Tiêu đề và Nội dung!");
    }

    setIsSending(true);

    // Giả lập gửi dữ liệu (Thay bằng API thực tế sau này)
    setTimeout(() => {
      setIsSending(false);
      
      alert(`✅ Gửi thông báo thành công!\nĐối tượng: ${
        formData.recipient === 'all' ? 'Tất cả' : 
        formData.recipient === 'student' ? 'Sinh viên' : 'Giảng viên'
      }`);

      setFormData({ title: '', content: '', recipient: 'all' });
    }, 1000);
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>TẠO THÔNG BÁO HỆ THỐNG</h2>
      
      <form onSubmit={handleSend} style={formStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Đối tượng nhận:</label>
          <select name="recipient" value={formData.recipient} onChange={handleChange} style={inputStyle}>
            <option value="all">Tất cả người dùng</option>
            <option value="student">Chỉ Sinh viên</option>
            <option value="teacher">Chỉ Giảng viên</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Tiêu đề:</label>
          <input 
            type="text" 
            name="title" 
            placeholder="Nhập tiêu đề..." 
            value={formData.title} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Nội dung:</label>
          <textarea 
            name="content" 
            rows="5" 
            placeholder="Nhập nội dung chi tiết..." 
            value={formData.content} 
            onChange={handleChange} 
            style={{ ...inputStyle, resize: 'vertical' }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSending} 
          style={{ ...btnStyle, background: isSending ? '#94a3b8' : '#6366f1' }}
        >
          {isSending ? "⌛ Đang gửi..." : "Gửi Thông Báo"}
        </button>
      </form>
    </div>
  );
}

// --- Styles System ---
const containerStyle = { background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const headerStyle = { margin: '0 0 25px 0', color: '#1e293b', fontSize: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', textAlign: 'center' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '14px', fontWeight: 'bold', color: '#475569' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };
const btnStyle = { padding: '14px', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', transition: 'all 0.2s' };