import { getPool, sql } from '../config/db.js';
import { fetchAll, fetchById, sendError, sendSuccess } from './controllerUtils.js';

export const getTopics = async (_req, res) => {
  return fetchAll(
    res,
    `
      SELECT dt.MaDeTai, dt.TenDeTai, dt.MoTa, dt.SoLuongToiDa, dt.TrangThai,
             hk.MaHocKy, hk.TenHocKy,
             gv.MaGiangVien, gv.HoTen AS TenGiangVien,
             (SELECT COUNT(*) FROM dbo.DangKyDeTai dk WHERE dk.MaDeTai = dt.MaDeTai AND dk.TrangThai = 'APPROVED') AS SoLuongDaDuyet
      FROM dbo.DeTai dt
      INNER JOIN dbo.HocKy hk ON hk.MaHocKy = dt.MaHocKy
      INNER JOIN dbo.GiangVien gv ON gv.MaGiangVien = dt.MaGiangVien
      ORDER BY dt.MaDeTai ASC
    `,
    'Failed to fetch topics',
  );
};

export const getTopicById = async (req, res) =>
  fetchById(
    res,
    'maDeTai',
    req.params.id,
    `
      SELECT dt.MaDeTai, dt.TenDeTai, dt.MoTa, dt.SoLuongToiDa, dt.TrangThai,
             hk.MaHocKy, hk.TenHocKy,
             gv.MaGiangVien, gv.HoTen AS TenGiangVien,
             (SELECT COUNT(*) FROM dbo.DangKyDeTai dk WHERE dk.MaDeTai = dt.MaDeTai AND dk.TrangThai = 'APPROVED') AS SoLuongDaDuyet
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

export const createTopic = async (req, res) => {
  const { id, semesterId, teacherId, name, description = null, maxStudents = 1, status = 'OPEN' } = req.body;

  if (!id || !semesterId || !teacherId || !name) {
    return sendError(res, 'Topic id, semester, teacher and name are required', null, 400);
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('semesterId', sql.VarChar, semesterId)
      .input('teacherId', sql.VarChar, teacherId)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('maxStudents', sql.Int, Number(maxStudents))
      .input('status', sql.VarChar, status)
      .query(`
        INSERT INTO dbo.DeTai (MaDeTai, MaHocKy, MaGiangVien, TenDeTai, MoTa, SoLuongToiDa, TrangThai)
        VALUES (@id, @semesterId, @teacherId, @name, @description, @maxStudents, @status)
      `);

    return sendSuccess(res, 'Topic created successfully', { id }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create topic', error);
  }
};

export const updateTopic = async (req, res) => {
  const { id } = req.params;
  const { semesterId, teacherId, name, description, maxStudents, status } = req.body;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('semesterId', sql.VarChar, semesterId)
      .input('teacherId', sql.VarChar, teacherId)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('maxStudents', sql.Int, maxStudents == null ? null : Number(maxStudents))
      .input('status', sql.VarChar, status)
      .query(`
        UPDATE dbo.DeTai
        SET
          MaHocKy = COALESCE(@semesterId, MaHocKy),
          MaGiangVien = COALESCE(@teacherId, MaGiangVien),
          TenDeTai = COALESCE(@name, TenDeTai),
          MoTa = COALESCE(@description, MoTa),
          SoLuongToiDa = COALESCE(@maxStudents, SoLuongToiDa),
          TrangThai = COALESCE(@status, TrangThai),
          UpdatedAt = SYSDATETIME()
        WHERE MaDeTai = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Topic not found', null, 404);
    }

    return sendSuccess(res, 'Topic updated successfully', { id });
  } catch (error) {
    return sendError(res, 'Failed to update topic', error);
  }
};

export const deleteTopic = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM dbo.DeTai WHERE MaDeTai = @id');

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Topic not found', null, 404);
    }

    return sendSuccess(res, 'Topic deleted successfully', { id });
  } catch (error) {
    return sendError(res, 'Failed to delete topic', error);
  }
};
