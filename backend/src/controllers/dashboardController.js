import { getPool } from '../config/db.js';
import { sendQueryError } from './controllerUtils.js';

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

    const departmentMap = {
      'An toan thong tin': 'An toàn thông tin',
      'Cong nghe phan mem': 'Công nghệ phần mềm',
      'He thong thong tin': 'Hệ thống thông tin',
      'Tri tue nhan tao': 'Trí tuệ nhân tạo'
    };

    const kpi = kpiResult.recordset[0];
    const departments = departmentResult.recordset.map((item) => {
      const boMonName = String(item.TenBoMon || '').trim();
      return {
        name: departmentMap[boMonName] || boMonName,
        totalTopics: item.TongDeTai,
        openTopics: item.DeTaiDangMo,
        percent: item.TongDeTai > 0 ? Math.round((item.DeTaiDangMo / item.TongDeTai) * 100) : 0,
      };
    });

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
