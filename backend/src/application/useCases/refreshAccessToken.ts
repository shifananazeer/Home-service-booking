import jwt from 'jsonwebtoken'
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as { email: string };
  
   
      const accessToken = jwt.sign(
        { email: decoded.email, role: "user" },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );
  
      return accessToken;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
}