import { getPool, sql } from '../config/db.js';
import { fetchAll, sendError, sendSuccess, getUpperRole } from './controllerUtils.js';

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
