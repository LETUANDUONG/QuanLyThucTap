import { getPool, sql } from '../config/db.js';

const sendQueryError = (res, error, message) => {
  res.status(500).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
};

const fetchAll = async (res, query, message) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(query);

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    sendQueryError(res, error, message);
  }
};

const fetchById = async (res, paramName, paramValue, query, message) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input(paramName, sql.VarChar, paramValue)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    return res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    return sendQueryError(res, error, message);
  }
};

export const getSemesters = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT MaHocKy, TenHocKy, NgayBatDau, NgayKetThuc, TrangThai, CreatedAt, UpdatedAt
      FROM dbo.HocKy
      ORDER BY NgayBatDau DESC
    `,
    'Failed to fetch semesters',
  );

export const getSemesterById = async (req, res) =>
  fetchById(
    res,
    'maHocKy',
    req.params.id,
    `
      SELECT MaHocKy, TenHocKy, NgayBatDau, NgayKetThuc, TrangThai, CreatedAt, UpdatedAt
      FROM dbo.HocKy
      WHERE MaHocKy = @maHocKy
    `,
    'Failed to fetch semester details',
  );

export const getAccounts = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT MaTaiKhoan, TenDangNhap, VaiTro, TrangThai, LanDangNhapCuoi, CreatedAt, UpdatedAt
      FROM dbo.TaiKhoan
      ORDER BY MaTaiKhoan ASC
    `,
    'Failed to fetch accounts',
  );

export const getStudents = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT sv.MaSinhVien, sv.HoTen, sv.Lop, sv.Email, sv.SoDienThoai, sv.NamHoc, sv.TrangThai,
             tk.TenDangNhap, tk.VaiTro
      FROM dbo.SinhVien sv
      INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = sv.MaTaiKhoan
      ORDER BY sv.MaSinhVien ASC
    `,
    'Failed to fetch students',
  );

export const getStudentById = async (req, res) =>
  fetchById(
    res,
    'maSinhVien',
    req.params.id,
    `
      SELECT sv.MaSinhVien, sv.HoTen, sv.Lop, sv.Email, sv.SoDienThoai, sv.NamHoc, sv.TrangThai,
             tk.TenDangNhap, tk.VaiTro
      FROM dbo.SinhVien sv
      INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = sv.MaTaiKhoan
      WHERE sv.MaSinhVien = @maSinhVien
    `,
    'Failed to fetch student details',
  );

export const getTeachers = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT gv.MaGiangVien, gv.HoTen, gv.BoMon, gv.Email, gv.SoDienThoai, gv.TrangThai,
             tk.TenDangNhap, tk.VaiTro
      FROM dbo.GiangVien gv
      INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gv.MaTaiKhoan
      ORDER BY gv.MaGiangVien ASC
    `,
    'Failed to fetch teachers',
  );

export const getTeacherById = async (req, res) =>
  fetchById(
    res,
    'maGiangVien',
    req.params.id,
    `
      SELECT gv.MaGiangVien, gv.HoTen, gv.BoMon, gv.Email, gv.SoDienThoai, gv.TrangThai,
             tk.TenDangNhap, tk.VaiTro
      FROM dbo.GiangVien gv
      INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gv.MaTaiKhoan
      WHERE gv.MaGiangVien = @maGiangVien
    `,
    'Failed to fetch teacher details',
  );

export const getTopics = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT dt.MaDeTai, dt.TenDeTai, dt.MoTa, dt.SoLuongToiDa, dt.TrangThai,
             hk.MaHocKy, hk.TenHocKy,
             gv.MaGiangVien, gv.HoTen AS TenGiangVien
      FROM dbo.DeTai dt
      INNER JOIN dbo.HocKy hk ON hk.MaHocKy = dt.MaHocKy
      INNER JOIN dbo.GiangVien gv ON gv.MaGiangVien = dt.MaGiangVien
      ORDER BY dt.MaDeTai ASC
    `,
    'Failed to fetch topics',
  );

export const getTopicById = async (req, res) =>
  fetchById(
    res,
    'maDeTai',
    req.params.id,
    `
      SELECT dt.MaDeTai, dt.TenDeTai, dt.MoTa, dt.SoLuongToiDa, dt.TrangThai,
             hk.MaHocKy, hk.TenHocKy,
             gv.MaGiangVien, gv.HoTen AS TenGiangVien
      FROM dbo.DeTai dt
      INNER JOIN dbo.HocKy hk ON hk.MaHocKy = dt.MaHocKy
      INNER JOIN dbo.GiangVien gv ON gv.MaGiangVien = dt.MaGiangVien
      WHERE dt.MaDeTai = @maDeTai
    `,
    'Failed to fetch topic details',
  );

export const getTopicSummary = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT MaDeTai, TenDeTai, SoLuongToiDa, TenGiangVien, TenHocKy, SoLuongDaDuyet
      FROM dbo.vw_TopicSummary
      ORDER BY MaDeTai ASC
    `,
    'Failed to fetch topic summary',
  );

export const getRegistrations = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT dk.MaDangKy, dk.MaSinhVien, sv.HoTen AS TenSinhVien, dk.MaDeTai, dt.TenDeTai,
             dk.NgayDangKy, dk.TrangThai, dk.LyDoTuChoi, dk.NgayDuyet, dk.NguoiDuyet
      FROM dbo.DangKyDeTai dk
      INNER JOIN dbo.SinhVien sv ON sv.MaSinhVien = dk.MaSinhVien
      INNER JOIN dbo.DeTai dt ON dt.MaDeTai = dk.MaDeTai
      ORDER BY dk.NgayDangKy DESC
    `,
    'Failed to fetch registrations',
  );

export const getRegistrationById = async (req, res) =>
  fetchById(
    res,
    'maDangKy',
    req.params.id,
    `
      SELECT dk.MaDangKy, dk.MaSinhVien, sv.HoTen AS TenSinhVien, dk.MaDeTai, dt.TenDeTai,
             dk.NgayDangKy, dk.TrangThai, dk.LyDoTuChoi, dk.NgayDuyet, dk.NguoiDuyet
      FROM dbo.DangKyDeTai dk
      INNER JOIN dbo.SinhVien sv ON sv.MaSinhVien = dk.MaSinhVien
      INNER JOIN dbo.DeTai dt ON dt.MaDeTai = dk.MaDeTai
      WHERE dk.MaDangKy = @maDangKy
    `,
    'Failed to fetch registration details',
  );

export const getRegistrationApprovalView = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT MaDangKy, MaSinhVien, TenSinhVien, MaDeTai, TenDeTai, TrangThai, LyDoTuChoi, NgayDangKy, NgayDuyet
      FROM dbo.vw_RegistrationApproval
      ORDER BY NgayDangKy DESC
    `,
    'Failed to fetch registration approval view',
  );

export const getReports = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT bc.MaBaoCao, bc.TenBaoCao, bc.HanNop, bc.TrangThai,
             hk.MaHocKy, hk.TenHocKy,
             gv.MaGiangVien AS MaNguoiTao, gv.HoTen AS TenNguoiTao
      FROM dbo.DotBaoCao bc
      INNER JOIN dbo.HocKy hk ON hk.MaHocKy = bc.MaHocKy
      LEFT JOIN dbo.GiangVien gv ON gv.MaGiangVien = bc.CreatedBy
      ORDER BY bc.HanNop DESC
    `,
    'Failed to fetch reports',
  );

export const getReportById = async (req, res) =>
  fetchById(
    res,
    'maBaoCao',
    req.params.id,
    `
      SELECT bc.MaBaoCao, bc.TenBaoCao, bc.HanNop, bc.TrangThai,
             hk.MaHocKy, hk.TenHocKy,
             gv.MaGiangVien AS MaNguoiTao, gv.HoTen AS TenNguoiTao
      FROM dbo.DotBaoCao bc
      INNER JOIN dbo.HocKy hk ON hk.MaHocKy = bc.MaHocKy
      LEFT JOIN dbo.GiangVien gv ON gv.MaGiangVien = bc.CreatedBy
      WHERE bc.MaBaoCao = @maBaoCao
    `,
    'Failed to fetch report details',
  );

export const getReportSubmissions = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT nbc.MaNopBaoCao, nbc.MaBaoCao, nbc.MaSinhVien, sv.HoTen AS TenSinhVien,
             nbc.TenFile, nbc.DuongDanFile, nbc.NgayNop, nbc.TrangThai, nbc.Diem, nbc.NhanXet,
             nbc.NguoiCham, gv.HoTen AS TenNguoiCham, bc.CreatedBy AS MaGiangVienPhuTrach
      FROM dbo.NopBaoCao nbc
      INNER JOIN dbo.SinhVien sv ON sv.MaSinhVien = nbc.MaSinhVien
      INNER JOIN dbo.DotBaoCao bc ON bc.MaBaoCao = nbc.MaBaoCao
      LEFT JOIN dbo.GiangVien gv ON gv.MaGiangVien = nbc.NguoiCham
      ORDER BY nbc.MaNopBaoCao DESC
    `,
    'Failed to fetch report submissions',
  );

export const getNotifications = async (_req, res) =>
  fetchAll(
    res,
    `
      SELECT MaThongBao, TieuDe, NoiDung, LoaiNguoiNhan, MaNguoiGui, NgayGui, IsRead
      FROM dbo.ThongBao
      ORDER BY NgayGui DESC, MaThongBao DESC
    `,
    'Failed to fetch notifications',
  );

export const getDashboardSummary = async (_req, res) => {
  try {
    const pool = await getPool();
    const [kpiResult, departmentResult, semesterResult] = await Promise.all([
      pool.request().query(`
        SELECT
          (SELECT COUNT(*) FROM dbo.DeTai) AS TongDeTai,
          (SELECT COUNT(*) FROM dbo.SinhVien) AS TongSinhVien,
          (SELECT COUNT(*) FROM dbo.DangKyDeTai WHERE TrangThai = 'APPROVED') AS SinhVienDaCoDeTai,
          (SELECT COUNT(*) FROM dbo.NopBaoCao WHERE TrangThai IN ('SUBMITTED', 'REJECTED')) AS BaoCaoChoCham
      `),
      pool.request().query(`
        SELECT
          gv.BoMon AS TenBoMon,
          COUNT(dt.MaDeTai) AS TongDeTai,
          SUM(CASE WHEN dt.TrangThai = 'OPEN' THEN 1 ELSE 0 END) AS DeTaiDangMo
        FROM dbo.GiangVien gv
        LEFT JOIN dbo.DeTai dt ON dt.MaGiangVien = gv.MaGiangVien
        GROUP BY gv.BoMon
        ORDER BY gv.BoMon ASC
      `),
      pool.request().query(`
        SELECT TOP 1 MaHocKy, TenHocKy, TrangThai, NgayBatDau, NgayKetThuc
        FROM dbo.HocKy
        ORDER BY CASE WHEN TrangThai = 'OPEN' THEN 0 ELSE 1 END, NgayBatDau DESC
      `),
    ]);

    const kpi = kpiResult.recordset[0];
    const departments = departmentResult.recordset.map((item) => ({
      name: item.TenBoMon,
      totalTopics: item.TongDeTai,
      openTopics: item.DeTaiDangMo,
      percent: item.TongDeTai > 0 ? Math.round((item.DeTaiDangMo / item.TongDeTai) * 100) : 0,
    }));

    return res.json({
      success: true,
      data: {
        totalTopics: kpi.TongDeTai,
        totalStudents: kpi.TongSinhVien,
        studentsWithTopics: kpi.SinhVienDaCoDeTai,
        reportsPendingReview: kpi.BaoCaoChoCham,
        currentSemester: semesterResult.recordset[0] || null,
        departments,
      },
    });
  } catch (error) {
    return sendQueryError(res, error, 'Failed to fetch dashboard summary');
  }
};
