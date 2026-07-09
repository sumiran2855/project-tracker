import nodemailer from 'nodemailer';

/**
 * Sends a password reset email using Nodemailer.
 * Falls back to server console logging if SMTP credentials are not configured in .env.
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullLink = `${appUrl}${resetLink}`;

  // Log to console in all cases for dev visibility
  console.log(`\n🔑 [PASSWORD RESET LINK]: ${fullLink}\n`);

  // Check if SMTP is configured
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      '⚠️ SMTP is not configured in .env. Falling back to console logging for password reset link.'
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_PORT === '465',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: SMTP_FROM || `"Project Work Tracker" <${SMTP_USER}>`,
    to: email,
    subject: 'Reset your Project Work Tracker Password',
    text: `You requested a password reset. Please use the following link to reset your password:\n\n${fullLink}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
          <div style="height: 36px; width: 36px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 14px; text-align: center; line-height: 36px;">
            PWT
          </div>
          <span style="font-size: 16px; font-weight: 700; color: #0f172a; margin-left: 8px;">Project Work Tracker</span>
        </div>
        
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; tracking: -0.025em; margin-bottom: 12px;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset the password for your Project Work Tracker account. Click the button below to choose a new password:
        </p>
        
        <div style="margin-bottom: 28px;">
          <a href="${fullLink}" target="_blank" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);">
            Reset Password
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 12px; margin-bottom: 8px; line-height: 1.5;">
          If the button above does not work, copy and paste the link below into your browser:
        </p>
        <p style="color: #4f46e5; font-size: 12px; word-break: break-all; margin-bottom: 28px; font-family: monospace;">
          ${fullLink}
        </p>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
          If you did not request a password reset, you can safely ignore this email. This link will expire in 1 hour.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
