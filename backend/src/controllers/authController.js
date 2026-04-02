import { getPool, sql } from '../config/db.js';

const roleMap = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

const sendError = (res, message, error, status = 500) => {
  res.status(status).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : undefined,
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendError(res, 'Username and password are required', null, 400);
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('username', sql.VarChar, username)
      .query(`
        SELECT
          tk.MaTaiKhoan,
          tk.TenDangNhap,
          tk.MatKhauHash,
          tk.VaiTro,
          tk.TrangThai,
          sv.MaSinhVien,
          sv.HoTen AS TenSinhVien,
          sv.Email AS EmailSinhVien,
          sv.SoDienThoai AS SoDienThoaiSinhVien,
          sv.Lop,
          gv.MaGiangVien,
          gv.HoTen AS TenGiangVien,
          gv.Email AS EmailGiangVien,
          gv.SoDienThoai AS SoDienThoaiGiangVien,
          gv.BoMon
        FROM dbo.TaiKhoan tk
        LEFT JOIN dbo.SinhVien sv ON sv.MaTaiKhoan = tk.MaTaiKhoan
        LEFT JOIN dbo.GiangVien gv ON gv.MaTaiKhoan = tk.MaTaiKhoan
        WHERE tk.TenDangNhap = @username
      `);

    if (result.recordset.length === 0) {
      return sendError(res, 'Invalid username or password', null, 401);
    }

    const account = result.recordset[0];

    if (account.TrangThai !== 'ACTIVE') {
      return sendError(res, 'This account is locked', null, 403);
    }

    if (account.MatKhauHash !== password) {
      return sendError(res, 'Invalid username or password', null, 401);
    }

    await pool
      .request()
      .input('accountId', sql.Int, account.MaTaiKhoan)
      .query(`
        UPDATE dbo.TaiKhoan
        SET LanDangNhapCuoi = SYSDATETIME(), UpdatedAt = SYSDATETIME()
        WHERE MaTaiKhoan = @accountId
      `);

    const role = roleMap[account.VaiTro] || 'student';
    const profile =
      role === 'student'
        ? {
            id: account.MaSinhVien,
            displayName: account.TenSinhVien,
            email: account.EmailSinhVien,
            phone: account.SoDienThoaiSinhVien,
            className: account.Lop,
          }
        : role === 'teacher'
          ? {
              id: account.MaGiangVien,
              displayName: account.TenGiangVien,
              email: account.EmailGiangVien,
              phone: account.SoDienThoaiGiangVien,
              department: account.BoMon,
            }
          : {
              id: `ADMIN-${account.MaTaiKhoan}`,
              displayName: account.TenDangNhap,
              email: null,
              phone: null,
            };

    return res.json({
      success: true,
      data: {
        accountId: account.MaTaiKhoan,
        username: account.TenDangNhap,
        role,
        profile,
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to login', error);
  }
};

export const changePassword = async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return sendError(res, 'Username, old password and new password are required', null, 400);
  }

  try {
    const pool = await getPool();
    const accountResult = await pool
      .request()
      .input('username', sql.VarChar, username)
      .query(`
        SELECT MaTaiKhoan, MatKhauHash
        FROM dbo.TaiKhoan
        WHERE TenDangNhap = @username
      `);

    if (accountResult.recordset.length === 0) {
      return sendError(res, 'Account not found', null, 404);
    }

    const account = accountResult.recordset[0];

    if (account.MatKhauHash !== oldPassword) {
      return sendError(res, 'Current password is incorrect', null, 400);
    }

    await pool
      .request()
      .input('accountId', sql.Int, account.MaTaiKhoan)
      .input('newPassword', sql.NVarChar, newPassword)
      .query(`
        UPDATE dbo.TaiKhoan
        SET MatKhauHash = @newPassword, UpdatedAt = SYSDATETIME()
        WHERE MaTaiKhoan = @accountId
      `);

    return res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    return sendError(res, 'Failed to change password', error);
  }
};
