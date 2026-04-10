const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;

// Set API Key
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

class EmailService {
  static async send({ to, subject, body }) {
    try {
      const sender = {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || "TalentFlow",
      };

      const receivers = [
        {
          email: to,
        },
      ];

      const response = await tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject,
        htmlContent: `
          <div style="font-family: Arial; max-width: 600px; margin: auto;">
            <h2 style="color: #4CAF50;">Welcome to TalentFlow 🚀</h2>
            
            <p>Hello,</p>
            
            <p>We're excited to have you onboard.</p>
            
            <p>${body}</p>

            <hr />
            
            <p style="font-size: 12px; color: #888;">
              If you didn’t request this, please ignore this email.
            </p>
          </div>
        `,
      });

      console.log("[Email] Sent:", response.messageId);

      return { success: true, messageId: response.messageId };
    } catch (error) {
      console.error("[Email] Error:", error.response?.body || error.message);
      throw error;
    }
  }
}

module.exports = { EmailService };
