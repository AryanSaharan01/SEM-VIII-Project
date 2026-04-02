require('dotenv').config();
const { BrevoClient } = require('@getbrevo/brevo');
const fs = require('fs');

const log = (msg) => { console.log(msg); fs.appendFileSync('brevo-result.txt', msg + '\n'); };

fs.writeFileSync('brevo-result.txt', '');
log('BREVO_API_KEY length: ' + (process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 'NOT SET'));
log('BREVO_SENDER_EMAIL: ' + (process.env.BREVO_SENDER_EMAIL || 'NOT SET'));

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY || '' });

async function main() {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Missing BREVO_API_KEY');
    }

    await client.transactionalEmails.sendTransacEmail({
      subject: 'Brevo OTP test',
      htmlContent: '<p>Brevo API test email from DTCS Skill Ledger.</p>',
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'DTCS Skill Ledger',
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: process.env.BREVO_SENDER_EMAIL }],
    });

    log('BREVO OK — transactional emails are working.');
  } catch (err) {
    log('BREVO FAILED: ' + err.message);
  }
  process.exit(0);
}

main();