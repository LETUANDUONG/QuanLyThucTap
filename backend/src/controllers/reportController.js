import { getPool, sql } from '../config/db.js';
import { fetchAll, fetchById, sendError, sendSuccess } from './controllerUtils.js';

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

export const createReport = async (req, res) => {
  const { id, semesterId, name, deadline, status = 'OPEN', createdBy = null } = req.body;

  if (!id || !semesterId || !name || !deadline) {
    return sendError(res, 'Report id, semester, name and deadline are required', null, 400);
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('semesterId', sql.VarChar, semesterId)
      .input('name', sql.NVarChar, name)
      .input('deadline', sql.DateTime2, deadline)
      .input('status', sql.VarChar, status)
      .input('createdBy', sql.VarChar, createdBy)
      .query(`
        INSERT INTO dbo.DotBaoCao (MaBaoCao, MaHocKy, TenBaoCao, HanNop, TrangThai, CreatedBy)
        VALUES (@id, @semesterId, @name, @deadline, @status, @createdBy)
      `);

    return sendSuccess(res, 'Report created successfully', { id }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create report', error);
  }
};

export const updateReport = async (req, res) => {
  const { id } = req.params;
  const { semesterId, name, deadline, status } = req.body;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('semesterId', sql.VarChar, semesterId)
      .input('name', sql.NVarChar, name)
      .input('deadline', sql.DateTime2, deadline)
      .input('status', sql.VarChar, status)
      .query(`
        UPDATE dbo.DotBaoCao
        SET
          MaHocKy = COALESCE(@semesterId, MaHocKy),
          TenBaoCao = COALESCE(@name, TenBaoCao),
          HanNop = COALESCE(@deadline, HanNop),
          TrangThai = COALESCE(@status, TrangThai),
          UpdatedAt = SYSDATETIME()
        WHERE MaBaoCao = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Report not found', null, 404);
    }

    return sendSuccess(res, 'Report updated successfully', { id });
  } catch (error) {
    return sendError(res, 'Failed to update report', error);
  }
};

export const deleteReport = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM dbo.DotBaoCao WHERE MaBaoCao = @id');

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Report not found', null, 404);
    }

    return sendSuccess(res, 'Report deleted successfully', { id });
  } catch (error) {
    return sendError(res, 'Failed to delete report', error);
  }
};

export const submitReport = async (req, res) => {
  const { id } = req.params;
  const { studentId, reportLink } = req.body;

  if (!studentId || !reportLink) {
    return sendError(res, 'Student and report link are required', null, 400);
  }

  try {
    const pool = await getPool();
    const existing = await pool
      .request()
      .input('reportId', sql.VarChar, id)
      .input('studentId', sql.VarChar, studentId)
      .query(`
        SELECT MaNopBaoCao
        FROM dbo.NopBaoCao
        WHERE MaBaoCao = @reportId AND MaSinhVien = @studentId
      `);

    if (existing.recordset.length === 0) {
      await pool
        .request()
        .input('reportId', sql.VarChar, id)
        .input('studentId', sql.VarChar, studentId)
        .input('fileName', sql.NVarChar, 'Google Docs')
        .input('filePath', sql.NVarChar, reportLink)
        .query(`
          INSERT INTO dbo.NopBaoCao (MaBaoCao, MaSinhVien, DuongDanFile, TenFile, NgayNop, TrangThai)
          VALUES (@reportId, @studentId, @filePath, @fileName, SYSDATETIME(), 'SUBMITTED')
        `);
    } else {
      await pool
        .request()
        .input('reportId', sql.VarChar, id)
        .input('studentId', sql.VarChar, studentId)
        .input('fileName', sql.NVarChar, 'Google Docs')
        .input('filePath', sql.NVarChar, reportLink)
        .query(`
          UPDATE dbo.NopBaoCao
          SET DuongDanFile = @filePath,
              TenFile = @fileName,
              NgayNop = SYSDATETIME(),
              TrangThai = 'SUBMITTED'
          WHERE MaBaoCao = @reportId AND MaSinhVien = @studentId
        `);
    }

    return sendSuccess(res, 'Report submitted successfully', { reportId: id, studentId });
  } catch (error) {
    return sendError(res, 'Failed to submit report', error);
  }
};

export const gradeReport = async (req, res) => {
  const { reportId, studentId } = req.params;
  const { score, comment, graderId } = req.body;

  if (score == null || !graderId) {
    return sendError(res, 'Score and grader are required', null, 400);
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('reportId', sql.VarChar, reportId)
      .input('studentId', sql.VarChar, studentId)
      .input('score', sql.Decimal(4, 2), Number(score))
      .input('comment', sql.NVarChar, comment || null)
      .input('graderId', sql.VarChar, graderId)
      .query(`
        UPDATE dbo.NopBaoCao
        SET
          Diem = @score,
          NhanXet = @comment,
          NguoiCham = @graderId,
          NgayCham = SYSDATETIME(),
          TrangThai = 'APPROVED'
        WHERE MaBaoCao = @reportId AND MaSinhVien = @studentId
      `);

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Submission not found', null, 404);
    }

    return sendSuccess(res, 'Report graded successfully', { reportId, studentId });
  } catch (error) {
    return sendError(res, 'Failed to grade report', error);
  }
};
