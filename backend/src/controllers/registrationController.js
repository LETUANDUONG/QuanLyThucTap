import { getPool, sql } from '../config/db.js';
import { fetchAll, fetchById, sendError, sendSuccess, buildNextCode, getUpperRole } from './controllerUtils.js';

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

export const createRegistration = async (req, res) => {
  const { studentId, topicId } = req.body;

  if (!studentId || !topicId) {
    return sendError(res, 'Student and topic are required', null, 400);
  }

  try {
    const pool = await getPool();
    const registrationId = await buildNextCode(pool, 'dbo.DangKyDeTai', 'MaDangKy', 'DK');

    await pool
      .request()
      .input('registrationId', sql.VarChar, registrationId)
      .input('studentId', sql.VarChar, studentId)
      .input('topicId', sql.VarChar, topicId)
      .query(`
        INSERT INTO dbo.DangKyDeTai (MaDangKy, MaSinhVien, MaDeTai, TrangThai)
        VALUES (@registrationId, @studentId, @topicId, 'PENDING')
      `);

    return sendSuccess(res, 'Registration created successfully', { id: registrationId }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create registration', error);
  }
};

export const updateRegistrationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason = null, reviewerId = null } = req.body;
  const normalizedStatus = getUpperRole(status);

  if (!['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(normalizedStatus)) {
    return sendError(res, 'Invalid registration status', null, 400);
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('status', sql.VarChar, normalizedStatus)
      .input('reason', sql.NVarChar, reason)
      .input('reviewerId', sql.VarChar, reviewerId)
      .query(`
        UPDATE dbo.DangKyDeTai
        SET
          TrangThai = @status,
          LyDoTuChoi = CASE WHEN @status = 'REJECTED' THEN @reason ELSE NULL END,
          NgayDuyet = CASE WHEN @status IN ('APPROVED', 'REJECTED') THEN SYSDATETIME() ELSE NULL END,
          NguoiDuyet = CASE WHEN @status IN ('APPROVED', 'REJECTED') THEN @reviewerId ELSE NULL END
        WHERE MaDangKy = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Registration not found', null, 404);
    }

    return sendSuccess(res, 'Registration updated successfully', { id, status: normalizedStatus });
  } catch (error) {
    return sendError(res, 'Failed to update registration', error);
  }
};

export const deleteRegistration = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM dbo.DangKyDeTai WHERE MaDangKy = @id');

    if (result.rowsAffected[0] === 0) {
      return sendError(res, 'Registration not found', null, 404);
    }

    return sendSuccess(res, 'Registration deleted successfully', { id });
  } catch (error) {
    return sendError(res, 'Failed to delete registration', error);
  }
};
