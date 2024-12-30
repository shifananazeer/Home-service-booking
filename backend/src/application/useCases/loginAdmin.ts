import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { AdminRepository } from '../../domain/repositories/adminRepository';
import { UserRepository } from '../../domain/repositories/userRepository';

export const loginAdmin = async (
    userRepository:UserRepository,
    email: string, password: string): Promise<{ accessToken: string; refreshToken: string ,adminId : string }> => {
    const admin = await userRepository.findByEmail(email)
    if (!admin || admin.role !== 'admin') {
        throw new Error('Invalid Email or Password');
      }

   const isPasswordValid=await bcrypt.compare(password,admin.password)
       if(!isPasswordValid) throw new Error("Invalid Password")
   

    const accessToken = jwt.sign(
        { email :admin.email, role:admin.role},
        process.env.ACCESS_TOKEN_SECRET as string , 
        {expiresIn: "15m"}
    )

    const refreshToken = jwt.sign(
        { email :admin.email, role:admin.role},
        process.env.REFRESH_TOKEN_SECRET as string , 
        {expiresIn: "7d"}
    )

    return { accessToken, refreshToken , adminId:admin._id.toString() };
};
