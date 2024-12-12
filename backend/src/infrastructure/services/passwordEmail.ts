import nodemailer from 'nodemailer';

export const sendResetEmail = async (email: string, token: string): Promise<void> => {
    if (!email || !token) {
        throw new Error('Email and token are required to send a reset email.');
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASS, // Your App Password
        },
        tls: {
            rejectUnauthorized: false, // Accept self-signed certificates (if necessary)
        },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    
    try {
        await transporter.sendMail({
            from: '"ServiceHub" <shifananazeer209@gmail.com>', // Sender's email
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click here to reset your password: ${resetLink}`,
            html: `
                <p>You requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send reset email');
    }
};
