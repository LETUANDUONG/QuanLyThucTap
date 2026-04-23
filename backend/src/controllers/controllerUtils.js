import { getPool, sql } from '../config/db.js';

export const sendError = (res, message, error, status = 500) => {
  res.status(status).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : undefined,
  });
};

export const sendSuccess = (res, message, data = null, status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const sendQueryError = (res, error, message) => {
  res.status(500).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
};

export const fetchAll = async (res, query, message) => {
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

export const fetchById = async (res, paramName, paramValue, query, message) => {
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

export const getUpperRole = (role) => String(role || '').trim().toUpperCase();

export const buildNextCode = async (pool, tableName, columnName, prefix) => {
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
