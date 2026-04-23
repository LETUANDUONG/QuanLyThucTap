const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const token = sessionStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    throw new Error(payload.message || 'Khong the tai du lieu tu may chu.');
  }

  return payload;
}

export async function login(username, password) {
  const payload = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return payload;
}

export async function changePassword(username, oldPassword, newPassword) {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ username, oldPassword, newPassword }),
  });
}

export async function fetchSemesters() {
  const payload = await request('/api/hoc-ky');
  return payload.data ?? [];
}

export async function createSemester(data) {
  return request('/api/hoc-ky', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSemester(id, data) {
  return request(`/api/hoc-ky/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSemester(id) {
  return request(`/api/hoc-ky/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchStudents() {
  const payload = await request('/api/sinh-vien');
  return payload.data ?? [];
}

export async function fetchTeachers() {
  const payload = await request('/api/giang-vien');
  return payload.data ?? [];
}

export async function createUser(data) {
  return request('/api/nguoi-dung', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUserStatus(role, id, status) {
  return request(`/api/nguoi-dung/${role}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteUser(role, id) {
  return request(`/api/nguoi-dung/${role}/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchTopics() {
  const payload = await request('/api/de-tai');
  return payload.data ?? [];
}

export async function fetchTopicSummary() {
  const payload = await request('/api/de-tai/tong-hop');
  return payload.data ?? [];
}

export async function createTopic(data) {
  return request('/api/de-tai', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTopic(id, data) {
  return request(`/api/de-tai/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTopic(id) {
  return request(`/api/de-tai/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchRegistrations() {
  const payload = await request('/api/dang-ky');
  return payload.data ?? [];
}

export async function fetchRegistrationApprovals() {
  const payload = await request('/api/dang-ky/duyet');
  return payload.data ?? [];
}

export async function createRegistration(data) {
  return request('/api/dang-ky', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRegistrationStatus(id, data) {
  return request(`/api/dang-ky/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteRegistration(id) {
  return request(`/api/dang-ky/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchReports() {
  const payload = await request('/api/bao-cao');
  return payload.data ?? [];
}

export async function createReport(data) {
  return request('/api/bao-cao', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReport(id, data) {
  return request(`/api/bao-cao/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReport(id) {
  return request(`/api/bao-cao/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchReportSubmissions() {
  const payload = await request('/api/bao-cao/nop');
  return payload.data ?? [];
}

export async function submitReport(reportId, data) {
  return request(`/api/bao-cao/${reportId}/nop`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function gradeReport(reportId, studentId, data) {
  return request(`/api/bao-cao/${reportId}/cham/${studentId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function fetchNotifications() {
  const payload = await request('/api/thong-bao');
  return payload.data ?? [];
}

export async function createNotification(data) {
  return request('/api/thong-bao', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchDashboardSummary() {
  const payload = await request('/api/dashboard/summary');
  return payload.data ?? null;
}
