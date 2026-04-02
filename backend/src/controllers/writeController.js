import { getPool, sql } from '../config/db.js';

const sendError = (res, message, error, status = 500) => {
  res.status(status).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : undefined,
  });
};

const sendSuccess = (res, message, data = null, status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

const getUpperRole = (role) => String(role || '').trim().toUpperCase();

const buildNextCode = async (pool, tableName, columnName, prefix) => {
  const result = await pool.request().query(`
    SELECT TOP 1 ${columnName} AS code
    FROM ${tableName}
    WHERE ${columnName} LIKE '${prefix}%'
    ORDER BY ${columnName} DESC
  `);

  const lastCode = result.recordset[0]?.code;
  if (!lastCode) {
    return `${prefix}01`;
  }

  const numericPart = Number(String(lastCode).slice(prefix.length)) || 0;
  return `${prefix}${String(numericPart + 1).padStart(2, '0')}`;
};

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
    await transaction.begin();

    const accountResult = await new sql.Request(transaction)
      .input('username', sql.VarChar, username)
      .input('password', sql.NVarChar, password)
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

export const createNotification = async (req, res) => {
  const { title, content, recipientType, senderId = null } = req.body;

  if (!title || !content || !recipientType) {
    return sendError(res, 'Title, content and recipient type are required', null, 400);
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('recipientType', sql.VarChar, getUpperRole(recipientType))
      .input('senderId', sql.VarChar, senderId)
      .query(`
        INSERT INTO dbo.ThongBao (TieuDe, NoiDung, LoaiNguoiNhan, MaNguoiGui, IsRead)
        OUTPUT INSERTED.MaThongBao
        VALUES (@title, @content, @recipientType, @senderId, 0)
      `);

    return sendSuccess(res, 'Notification created successfully', { id: result.recordset[0].MaThongBao }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create notification', error);
  }
};
