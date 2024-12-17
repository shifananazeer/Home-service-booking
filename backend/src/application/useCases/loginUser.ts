import { UserRepository } from "../../domain/repositories/userRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser=async (
    userRepository: UserRepository,
     email:string, password:string
    ) : Promise<{ accessToken: string; refreshToken: string }> => {

    const user = await userRepository.findByEmail(email)

    if(user?.isBlocked) throw new Error ('You are Blocked by Admin . please contact Admin')
    if(!user) throw new Error("Invalid Email or Password")

    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid) throw new Error("Invalid Password")

       // Generate Access Token
  const accessToken = jwt.sign(
    { email: user.email, role: "user" },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" } 
  );

  // Generate Refresh Token
  const refreshToken = jwt.sign(
    { email: user.email },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" } 
  );

  return { accessToken, refreshToken };
}