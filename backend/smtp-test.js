require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');

const log = (msg) => { console.log(msg); fs.appendFileSync('smtp-result.txt', msg + '\n'); };

fs.writeFileSync('smtp-result.txt', '');
log('SMTP_USER: ' + process.env.SMTP_USER);
log('SMTP_PASS length: ' + (process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 'NOT SET'));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false },
});

async function main() {
  try {
    await transporter.verify();
    log('SMTP OK — emails will send correctly!');
  } catch (err) {
    log('SMTP FAILED: ' + err.message);
  }
  process.exit(0);
}

main();
