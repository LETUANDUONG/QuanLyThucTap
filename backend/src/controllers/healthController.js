import { getPool } from '../config/db.js';

export const getHealth = (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
};

export const testDatabaseConnection = async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT GETDATE() AS serverTime');

    res.json({
      success: true,
      message: 'Connected to SQL Server successfully',
      data: result.recordset[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to SQL Server',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getSqlVersion = async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query("SELECT @@VERSION AS versionInfo");

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to query SQL Server version',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
