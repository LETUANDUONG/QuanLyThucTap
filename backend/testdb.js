import { getPool } from './src/config/db.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const p = await getPool();
    const r = await p.request().query("SELECT MaDeTai, TenDeTai FROM dbo.DeTai");
    console.log("Topics:", r.recordset);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
