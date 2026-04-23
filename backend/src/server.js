import dotenv from 'dotenv';
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDb } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = Number(process.env.PORT) || 5000;

const dbConnect = async () => {
  try {
    await connectDb();
    console.log('Connected to SQL Server successfully');

    app.listen(port, () => {
      console.log(`Backend server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to SQL Server');
    if (error instanceof Error) {
      console.error(error.stack || error.message);
    } else {
      console.error(util.inspect(error, { depth: 5, colors: false }));
    }
    process.exit(1);
  }
};

dbConnect();
