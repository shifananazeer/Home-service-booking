import nodemailer from 'nodemailer';

export const sendResetEmail = async (email: string, token: string , personType: number): Promise<void> => {
    if (!email || !token) {
        throw new Error('Email and token are required to send a reset email.');
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
        tls: {
            rejectUnauthorized: false, 
        },
    });

    let resetLink = '';
        if (personType === 0) { 
            resetLink = `http://localhost:5173/worker/reset-password?token=${token}`;
        } else { 
            resetLink = `http://localhost:5173/reset-password?token=${token}`;
        }

    try {
        await transporter.sendMail({
            from: '"ServiceHub" <shifananazeer209@gmail.com>', 
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click here to reset your password: ${resetLink}`,
            html: `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>This link is valid for 1 hour.</p>
        `,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send reset email');
    }
};
