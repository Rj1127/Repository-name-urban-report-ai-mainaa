import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard Gmail SMTP configuration
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"Smart Nagar Reporting System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Authentication OTP - Smart Nagar",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #8b0000; margin: 0;">Smart Nagar Reporting Portal</h2>
                <p style="color: #666; margin-top: 5px;">Secure Identity Verification</p>
            </div>
            
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">You have requested to authenticate with the Smart Nagar Reporting platform.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8b0000;">${otp}</span>
            </div>
            
            <p style="font-size: 14px; color: #666;">This code is valid for exactly <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0 20px;" />
            <p style="font-size: 12px; color: #999; text-align: center;">
                If you did not initiate this request, you can safely ignore this email.<br>
                © 2026 Smart Nagar Reporting Portal (SNRP)
            </p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP successfully deployed to ${email}`);
        return true;
    } catch (error) {
        console.error("Failed to push OTP through NodeMailer SMTP:", error);
        return false;
    }
};
