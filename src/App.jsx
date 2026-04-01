import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Components & Layout
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

// Quản lý đề tài & Nhân sự
import UserManagement from './pages/UserManagement';
import SemesterManagement from './pages/SemesterManagement';
import TopicListAdmin from './pages/TopicListAdmin';
import TopicListStudent from './pages/TopicListStudent';
import RegistrationApproval from './pages/RegistrationApproval';

// Hệ thống báo cáo
import ReportList from './pages/ReportList';
import TeacherList from './pages/TeacherList';
import ReportDetail from './pages/ReportDetail';
import ReportSubmissions from './pages/ReportSubmissions';

// Quản lý thông báo
import NotificationManagement from './pages/NotificationManagement';

/**
 * Higher-Order Component để bảo vệ các route yêu cầu đăng nhập
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Điều hướng trang chủ dựa trên vai trò người dùng (Role-based Routing)
 */
const RoleBasedHome = () => {
  const role = sessionStorage.getItem('userRole');
  
  if (role === 'student') return <Navigate to="/de-tai-sinh-vien" replace />;
  return <Navigate to="/thong-ke" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Private Routes (Wrapped in Layout & ProtectedRoute) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Mặc định điều hướng theo Role */}
          <Route index element={<RoleBasedHome />} />
          
          {/* Quản trị hệ thống */}
          <Route path="thong-ke" element={<Dashboard />} />
          <Route path="hoc-ky" element={<SemesterManagement />} />
          <Route path="nhan-su" element={<UserManagement />} />
          <Route path="doi-mat-khau" element={<ChangePassword />} />
          <Route path="thong-bao" element={<NotificationManagement />} />
          
          {/* Quản lý Đề tài */}
          <Route path="quan-ly-de-tai" element={<TopicListAdmin />} />
          <Route path="de-tai-sinh-vien" element={<TopicListStudent />} />
          <Route path="duyet-dang-ky" element={<RegistrationApproval />} />
          
          {/* Quản lý Báo cáo & Phân luồng nâng cao */}
          <Route path="bao-cao">
            <Route index element={<ReportList />} />
            <Route path="teachers" element={<TeacherList />} />
            <Route path="chi-tiet/:id" element={<ReportDetail />} />
            <Route path="submissions/:id/:teacherId" element={<ReportSubmissions />} />
            <Route path="cham-diem/:id/:studentId" element={<ReportDetail />} />
          </Route>
          
        </Route>

        {/* Fallback cho các đường dẫn không tồn tại */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;