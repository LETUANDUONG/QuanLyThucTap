import { getPool, sql } from '../config/db.js';
import { fetchAll, fetchById, sendError, sendSuccess } from './controllerUtils.js';

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

export const createSemester = async (req, res) => {
  const { id, name, startDate, endDate, status = 'CLOSED' } = req.body;

  if (!id || !name || !startDate || !endDate) {
    return sendError(res, 'Semester id, name, start date and end date are required', null, 400);
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('name', sql.NVarChar, name)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('status', sql.VarChar, status)
      .query(`
        INSERT INTO dbo.HocKy (MaHocKy, TenHocKy, NgayBatDau, NgayKetThuc, TrangThai)
        VALUES (@id, @name, @startDate, @endDate, @status)
      `);

    return sendSuccess(res, 'Semester created successfully', { id }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create semester', error);
  }
};

export const updateSemester = async (req, res) => {
  const { id } = req.params;
  const { name, startDate, endDate, status } = req.body;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('name', sql.NVarChar, name)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('status', sql.VarChar, status)
      .query(`
        UPDATE dbo.HocKy
        SET
          TenHocKy = COALESCE(@name, TenHocKy),
          NgayBatDau = COALESCE(@startDate, NgayBatDau),
          NgayKetThuc = COALESCE(@endDate, NgayKetThuc),
          TrangThai = COALESCE(@status, TrangThai),
          UpdatedAt = SYSDATETIME()
        WHERE MaHocKy = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Semester not found', null, 404);
    }

    return sendSuccess(res, 'Semester updated successfully', { id });
  } catch (error) {
    return sendError(res, 'Failed to update semester', error);
  }
};

export const deleteSemester = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM dbo.HocKy WHERE MaHocKy = @id');

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Semester not found', null, 404);
    }

    return sendSuccess(res, 'Semester deleted successfully', { id });
  } catch (error) {
    return sendError(res, 'Failed to delete semester', error);
  }
};
