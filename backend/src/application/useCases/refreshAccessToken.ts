import jwt from 'jsonwebtoken';

export const refreshAccessToken = async (refreshToken: string, type: string): Promise<string> => {
    try {
        console.log("Received refresh token:", refreshToken);

        // Decode token first to get role & expiration time
        const decoded = jwt.decode(refreshToken) as { email: string; role: string; exp: number } | null;

        if (!decoded || !decoded.role || !decoded.exp) {
            console.error("Invalid refresh token during decode:", refreshToken);
            throw new Error("Invalid refresh token");
        }

        // Check if refresh token is expired
        if (Date.now() >= decoded.exp * 1000) {
            console.error("Refresh token is expired:", decoded.exp);
            throw new Error("Refresh token has expired, please log in again.");
        }

        // Select the correct secret key based on role
        let secretKey = "";
        if (type === "admin") {
            secretKey = process.env.ADMIN_REFRESH_TOKEN_SECRET as string;
        } else if (type === "worker") {
            secretKey = process.env.WORKER_REFRESH_TOKEN_SECRET as string;
        } else if (type === "user") {
            secretKey = process.env.REFRESH_TOKEN_SECRET as string;
        } else {
            throw new Error("Unauthorized role");
        }

        if (!secretKey) {
            console.error("Secret key is missing for role:", type);
            throw new Error("Missing secret key for token verification");
        }

        console.log(`Token Type: ${type}, Using Secret Key: ${secretKey}`);

        // Verify the refresh token
        const verified = jwt.verify(refreshToken, secretKey) as { email: string; role: string };

        console.log("Verified token data:", verified);

        // Generate new access token
        const accessToken = jwt.sign(
            { email: verified.email, role: verified.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        return accessToken;
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            console.error("JWT Expired:", error);
            throw new Error("Refresh token has expired, please log in again.");
        } else if (error.name === "JsonWebTokenError") {
            console.error("Invalid JWT Signature:", error);
            throw new Error("Invalid refresh token signature.");
        } else {
            console.error("Error refreshing token:", error);
            throw new Error("Invalid or expired refresh token.");
        }
    }
};
