dotenv.config();
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
