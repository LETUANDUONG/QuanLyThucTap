import { getPool, sql } from '../config/db.js';
import { fetchAll, fetchById, sendError, sendSuccess, getUpperRole } from './controllerUtils.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

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

export const createUser = async (req, res) => {
  const { role, id, name, extra, email, phone = null, username, password = '123456' } = req.body;
  const normalizedRole = getUpperRole(role);

  if (!['STUDENT', 'TEACHER'].includes(normalizedRole)) {
    return sendError(res, 'Role must be STUDENT or TEACHER', null, 400);
  }

  if (!id || !name || !extra || !email || !username) {
    return sendError(res, 'Missing required user information', null, 400);
  }

  const transaction = new sql.Transaction(await getPool());

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await transaction.begin();

    const accountResult = await new sql.Request(transaction)
      .input('username', sql.VarChar, username)
      .input('password', sql.NVarChar, hashed)
      .input('role', sql.VarChar, normalizedRole)
      .query(`
        INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauHash, VaiTro, TrangThai)
        OUTPUT INSERTED.MaTaiKhoan
        VALUES (@username, @password, @role, 'ACTIVE')
      `);

    const accountId = accountResult.recordset[0].MaTaiKhoan;

    if (normalizedRole === 'STUDENT') {
      await new sql.Request(transaction)
        .input('id', sql.VarChar, id)
        .input('accountId', sql.Int, accountId)
        .input('name', sql.NVarChar, name)
        .input('extra', sql.NVarChar, extra)
        .input('email', sql.VarChar, email)
        .input('phone', sql.VarChar, phone)
        .query(`
          INSERT INTO dbo.SinhVien (MaSinhVien, MaTaiKhoan, HoTen, Lop, Email, SoDienThoai, TrangThai)
          VALUES (@id, @accountId, @name, @extra, @email, @phone, 'ACTIVE')
        `);
    } else {
      await new sql.Request(transaction)
        .input('id', sql.VarChar, id)
        .input('accountId', sql.Int, accountId)
        .input('name', sql.NVarChar, name)
        .input('extra', sql.NVarChar, extra)
        .input('email', sql.VarChar, email)
        .input('phone', sql.VarChar, phone)
        .query(`
          INSERT INTO dbo.GiangVien (MaGiangVien, MaTaiKhoan, HoTen, BoMon, Email, SoDienThoai, TrangThai)
          VALUES (@id, @accountId, @name, @extra, @email, @phone, 'ACTIVE')
        `);
    }

    await transaction.commit();
    return sendSuccess(res, 'User created successfully', { id, username }, 201);
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback().catch(() => {});
    }
    return sendError(res, 'Failed to create user', error);
  }
};

export const updateUserStatus = async (req, res) => {
  const { role, id } = req.params;
  const { status } = req.body;
  const normalizedRole = getUpperRole(role);

  if (!['STUDENT', 'TEACHER'].includes(normalizedRole) || !['ACTIVE', 'LOCKED'].includes(getUpperRole(status))) {
    return sendError(res, 'Invalid role or status', null, 400);
  }

  try {
    const pool = await getPool();
    const tableName = normalizedRole === 'STUDENT' ? 'SinhVien' : 'GiangVien';
    const keyColumn = normalizedRole === 'STUDENT' ? 'MaSinhVien' : 'MaGiangVien';

    const ownerResult = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query(`
        SELECT MaTaiKhoan
        FROM dbo.${tableName}
        WHERE ${keyColumn} = @id
      `);

    if (ownerResult.recordset.length === 0) {
      return sendError(res, 'User not found', null, 404);
    }

    const accountId = ownerResult.recordset[0].MaTaiKhoan;
    await pool
      .request()
      .input('id', sql.VarChar, id)
      .input('accountId', sql.Int, accountId)
      .input('status', sql.VarChar, getUpperRole(status))
      .query(`
        UPDATE dbo.${tableName}
        SET TrangThai = @status, UpdatedAt = SYSDATETIME()
        WHERE ${keyColumn} = @id;

        UPDATE dbo.TaiKhoan
        SET TrangThai = @status, UpdatedAt = SYSDATETIME()
        WHERE MaTaiKhoan = @accountId;
      `);

    return sendSuccess(res, 'User status updated successfully', { id, status: getUpperRole(status) });
  } catch (error) {
    return sendError(res, 'Failed to update user status', error);
  }
};

export const deleteUser = async (req, res) => {
  const { role, id } = req.params;
  const normalizedRole = getUpperRole(role);

  if (!['STUDENT', 'TEACHER'].includes(normalizedRole)) {
    return sendError(res, 'Invalid role', null, 400);
  }

  const transaction = new sql.Transaction(await getPool());

  try {
    await transaction.begin();

    const tableName = normalizedRole === 'STUDENT' ? 'SinhVien' : 'GiangVien';
    const keyColumn = normalizedRole === 'STUDENT' ? 'MaSinhVien' : 'MaGiangVien';
    const ownerResult = await new sql.Request(transaction)
      .input('id', sql.VarChar, id)
      .query(`
        SELECT MaTaiKhoan
        FROM dbo.${tableName}
        WHERE ${keyColumn} = @id
      `);

    if (ownerResult.recordset.length === 0) {
      await transaction.rollback();
      return sendError(res, 'User not found', null, 404);
    }

    const accountId = ownerResult.recordset[0].MaTaiKhoan;

    if (normalizedRole === 'STUDENT') {
      await new sql.Request(transaction)
        .input('id', sql.VarChar, id)
        .query(`
          DELETE FROM dbo.NopBaoCao WHERE MaSinhVien = @id;
          DELETE FROM dbo.DangKyDeTai WHERE MaSinhVien = @id;
          DELETE FROM dbo.SinhVien WHERE MaSinhVien = @id;
        `);
    } else {
      await new sql.Request(transaction)
        .input('id', sql.VarChar, id)
        .query(`
          UPDATE dbo.DangKyDeTai SET NguoiDuyet = NULL WHERE NguoiDuyet = @id;
          UPDATE dbo.NopBaoCao SET NguoiCham = NULL WHERE NguoiCham = @id;
          UPDATE dbo.DotBaoCao SET CreatedBy = NULL WHERE CreatedBy = @id;
          DELETE FROM dbo.DeTai WHERE MaGiangVien = @id;
          DELETE FROM dbo.GiangVien WHERE MaGiangVien = @id;
        `);
    }

    await new sql.Request(transaction)
      .input('accountId', sql.Int, accountId)
      .query('DELETE FROM dbo.TaiKhoan WHERE MaTaiKhoan = @accountId');

    await transaction.commit();
    return sendSuccess(res, 'User deleted successfully', { id });
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback().catch(() => {});
    }
    return sendError(res, 'Failed to delete user', error);
  }
};
