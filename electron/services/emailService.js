const nodemailer = require("nodemailer");

// Email configuration
const EMAIL_CONFIG = {
  SENDER_EMAIL: "authentic4tion@gmail.com",
  APP_PASSWORD: "mxyq zrgx iwgg gyhh"
};

let transporter = null;

function initializeTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_CONFIG.SENDER_EMAIL,
        pass: EMAIL_CONFIG.APP_PASSWORD
      }
    });
  }
  return transporter;
}

async function sendVerificationEmail(email, username, verificationCode) {
  try {
    const transport = initializeTransporter();
    
    const mailOptions = {
      from: EMAIL_CONFIG.SENDER_EMAIL,
      to: email,
      subject: "CyberSim Email Verification Code",
      html: `
        <div style="font-family: 'JetBrainsMono', monospace; background: #0a0e0f; color: #d7fff0; padding: 20px; border: 1px solid #1e2a2a; border-radius: 16px;">
          <div style="margin-bottom: 20px;">
            <h1 style="color: #00ff88; margin: 0;">CyberSim Email Verification</h1>
          </div>
          
          <p>Welcome, <strong>${username}</strong>!</p>
          
          <p>Thank you for registering with CyberSim. To complete your account setup, please use the verification code below:</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <div style="background: #111518; padding: 20px; border-radius: 8px; border: 2px solid #00ff88; display: inline-block;">
              <div style="color: #00ff88; font-size: 32px; font-weight: bold; letter-spacing: 10px; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
          </div>
          
          <p style="text-align: center;">Enter this code in the verification page to activate your account.</p>
          
          <hr style="border: none; border-top: 1px solid #1e2a2a; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #7a8d8d;">
            This verification code expires in 30 minutes. If you did not create this account, please ignore this email.
          </p>
        </div>
      `
    };

    await transport.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email. Please try again.");
  }
}

module.exports = {
  sendVerificationEmail,
  initializeTransporter
};
