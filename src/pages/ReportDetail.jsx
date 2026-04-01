import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReportDetail() {
  const { id, studentId } = useParams(); 
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole');

  const [selectedFile, setSelectedFile] = useState(null); 
  const [fileUrl, setFileUrl] = useState(null);
  const [comment, setComment] = useState('');
  const [score, setScore] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Xử lý file đầu vào
  const handleProcessFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFileUrl(objectUrl);
  };

  // Cleanup bộ nhớ khi component unmount
  useEffect(() => {
    return () => { if (fileUrl) URL.revokeObjectURL(fileUrl); };
  }, [fileUrl]);

  // Logic Kéo thả
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); 
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) handleProcessFile(e.dataTransfer.files[0]);
  };

  // Gửi đánh giá (Dành cho Giảng viên)
  const handleSubmit = () => {
    const numScore = parseFloat(score);
    if (!comment.trim() || isNaN(numScore)) return alert("Lỗi: Vui lòng nhập đầy đủ nhận xét và điểm!");
    if (numScore < 0 || numScore > 10) return alert("Lỗi: Điểm phải từ 0 đến 10!");
    
    alert(`Đã gửi đánh giá thành công! Điểm: ${numScore}`);
  };

  return (
    <div style={containerStyle}>
      {/* Điều hướng quay lại */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} style={btnBackStyle}>
          ← Quay lại danh sách {role === 'student' ? 'báo cáo' : 'sinh viên nộp bài'}
        </button>
      </div>

      <div style={headerStyle}>
        <h2 style={titleStyle}>CHI TIẾT BÁO CÁO {id && `- ${id}`}</h2>
      </div>
      
      {/* Thông tin đối tượng đang chấm (Dành cho GV/Admin) */}
      {role !== 'student' && studentId && (
        <div style={infoBoxStyle}>
          <p style={{ margin: 0 }}>Đang chấm bài của Sinh viên: <strong>{studentId}</strong></p>
        </div>
      )}

      {/* Upload area (Chỉ Sinh viên) */}
      {role === 'student' && (
        <div 
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          style={{ ...dropZoneStyle, border: isDragging ? '2px dashed #3b82f6' : '2px dashed #cbd5e1', background: isDragging ? '#eff6ff' : '#f8fafc' }}
        >
          <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>☁️ Kéo thả file báo cáo vào đây</p>
          <label style={btnUploadLabelStyle}>
            Chọn tệp
            <input type="file" onChange={(e) => handleProcessFile(e.target.files[0])} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {/* Trạng thái file đính kèm */}
      <div style={attachmentBoxStyle}>
        <strong style={{ marginRight: '10px' }}>File đính kèm: </strong>  
        {selectedFile ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{selectedFile.name}</span>
            {role === 'teacher' && (
              <a href={fileUrl} download={selectedFile.name} target="_blank" rel="noreferrer" style={btnDownloadStyle}>
                ⬇️ Tải xuống
              </a>
            )}
          </div>
        ) : <span style={{ color: '#94a3b8' }}>Chưa có file nào</span>}
      </div>

      {/* Form Đánh giá / Kết quả */}
      {role === 'teacher' ? (
        <div style={reviewContainerStyle}>
          <h3 style={subTitleStyle}>Đánh giá của Giảng viên</h3>
          <textarea 
            value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập phản hồi/ nhận xét..." 
            style={textareaStyle}
          />
          <div style={submitRowStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <strong style={{ fontSize: '18px', marginRight: '10px' }}>Điểm:</strong>
              <input 
                type="number" min="0" max="10" step="0.1" 
                value={score} onChange={(e) => setScore(e.target.value)} 
                placeholder="/10" style={inputScoreStyle} 
              />
            </div>
            <button onClick={handleSubmit} style={btnSubmitStyle}>GỬI ĐÁNH GIÁ</button>
          </div>
        </div>
      ) : (
        <div style={{ ...resultContainerStyle, background: role === 'admin' ? '#f8fafc' : '#f0fdf4' }}>
          <h3 style={subTitleStyle}>{role === 'admin' ? 'Xem đánh giá (Admin)' : 'Kết quả của bạn'}</h3>
          <p><strong>Nhận xét:</strong> Bài làm tốt, đúng tiến độ.</p>
          <p><strong>Điểm: <span style={{ color: '#dc2626' }}>8.5</span>/10</strong></p>
          {role === 'admin' && <p style={adminNoteStyle}>* Admin chỉ có quyền xem, không có quyền chấm điểm hoặc tải file bài nộp.</p>}
        </div>
      )}
    </div>
  );
}

// --- Styles System ---
const containerStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '850px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const btnBackStyle = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 'bold' };
const headerStyle = { borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' };
const infoBoxStyle = { marginBottom: '20px', padding: '12px 15px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6', fontSize: '14px' };
const dropZoneStyle = { padding: '40px', textAlign: 'center', borderRadius: '12px', margin: '20px 0', transition: 'all 0.2s ease' };
const btnUploadLabelStyle = { display: 'inline-block', padding: '8px 20px', background: '#e2e8f0', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };
const attachmentBoxStyle = { padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '14px' };
const btnDownloadStyle = { background: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' };
const reviewContainerStyle = { background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const subTitleStyle = { margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#334155' };
const textareaStyle = { width: '100%', height: '100px', marginBottom: '15px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };
const submitRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const inputScoreStyle = { width: '80px', padding: '8px', fontSize: '16px', border: '2px solid #1e293b', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' };
const btnSubmitStyle = { background: '#1e293b', color: '#fff', padding: '10px 30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', border: 'none' };
const resultContainerStyle = { padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '14px' };
const adminNoteStyle = { fontSize: '11px', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' };