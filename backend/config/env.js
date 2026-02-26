const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const required = [
  'DATABASE_URL', 'JWT_SECRET',
  'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS',
];

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing env variable: ${key}`);
  }
});
