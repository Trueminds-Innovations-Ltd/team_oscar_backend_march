const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class EmailService {
  static async send({ to, subject, body }) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'TalentFlow'}" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[Email] Error:', error.message);
      throw error;
    }
  }
}

const sendEmail = async ({ to, subject, body }) => {
  return EmailService.send({ to, subject, body });
};

module.exports = { sendEmail, EmailService };
