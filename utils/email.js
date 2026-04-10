const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

class EmailService {
  static async send({ to, subject, body }) {
    try {
      if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is missing");
      }

      const sender = {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || "TalentFlow",
      };

      const response = await tranEmailApi.sendTransacEmail({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: `
          <div style="font-family: Arial; max-width: 600px; margin: auto;">
            <h2 style="color: #4CAF50;">TalentFlow 🚀</h2>
            
            <p>Hello,</p>

            <p>${body}</p>

            <hr />

            <p style="font-size: 12px; color: #888;">
              If you didn’t request this email, ignore it.
            </p>
          </div>
        `,
        textContent: body,
      });

      console.log("✅ Email sent:", response.messageId);

      return { success: true, messageId: response.messageId };
    } catch (error) {
      console.error(
        "❌ Email error:",
        error.response?.body || error.message || error,
      );
      throw error;
    }
  }
}

module.exports = { EmailService };
