const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const hasSendGridConfig = () => {
  return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM);
};

const hasSmtpConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const sendWithSendGrid = async ({ to, subject, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const response = await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM,
    subject,
    html
  });
  const statusCode = response?.[0]?.statusCode || 'unknown';
  console.log(`Email sent via SendGrid (status: ${statusCode}) to ${to}`);
  return true;
};

// Helper to create a configured transporter
const createTransporter = async () => {
  // If no SMTP settings are provided, use Ethereal for testing
  if (!hasSmtpConfig()) {
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  // Use provided SMTP settings
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Prefer SendGrid when configured for production reliability.
    if (hasSendGridConfig()) {
      return await sendWithSendGrid({ to, subject, html });
    }

    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"Freelance Hub" <${process.env.SMTP_FROM || 'noreply@freelancehub.com'}>`,
      to,
      subject,
      html,
    });
    
    console.log(`Email sent: ${info.messageId}`);
    if (!hasSmtpConfig()) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return true;
  } catch (error) {
    console.error('Error sending email:', error?.response?.body || error);
    if (!hasSendGridConfig() && hasSmtpConfig()) {
      console.error('SMTP config is set but authentication failed. Verify SMTP_USER/SMTP_PASS for that exact account.');
    }
    return false;
  }
};

const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background-color: #10B981; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Freelance Hub</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; font-size: 24px; margin-top: 0; margin-bottom: 20px;">Welcome to the community, ${name}! 🎉</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We're absolutely thrilled to have you on board. Freelance Hub is your new home for connecting with top-tier talent and finding the best freelance opportunities worldwide.
          </p>
          
          <div style="background-color: #f3f4f6; border-left: 4px solid #10B981; padding: 15px 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
            <p style="color: #374151; margin: 0; font-size: 15px; font-weight: 500;">
              Whether you're here to hire experts or offer your own skills, you are exactly where you need to be.
            </p>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Ready to dive in? Get started by setting up your profile, exploring available services, or posting your very first job.
          </p>
          
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #10B981; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);">
              Explore Freelance Hub
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 30px;" />
          
          <p style="color: #6b7280; font-size: 15px; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin-top: 0;">The Freelance Hub Team</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
            &copy; ${new Date().getFullYear()} Freelance Hub. All rights reserved.
          </p>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 5px;">
            You are receiving this email because you recently signed up for an account.
          </p>
        </div>
        
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Welcome to Freelance Hub! 🎉', html });
};

const sendPasswordResetOtp = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10B981;">Password Reset Request</h2>
      <p>We received a request to reset your password. Use the OTP below to proceed.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>The Freelance Hub Team</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Your Password Reset OTP', html });
};

const sendOfflineMessageEmail = async (email, senderName, previewText) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10B981;">New Message from ${senderName}</h2>
      <p>You have received a new message on Freelance Hub while you were away:</p>
      <blockquote style="border-left: 4px solid #10B981; padding-left: 15px; color: #555; font-style: italic;">
        "${previewText}"
      </blockquote>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/chat" style="display: inline-block; background-color: #10B981; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Reply Now</a></p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>The Freelance Hub Team</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject: `New Message from ${senderName}`, html });
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetOtp,
  sendOfflineMessageEmail
};
