import jwt from 'jsonwebtoken'
export const refreshAccessToken = async (refreshToken: string , type : string): Promise<string> => {
    try {
    
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as { email: string };
  
   
      const accessToken = jwt.sign(
        { email: decoded.email, role: type },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );
  
      return accessToken;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
}