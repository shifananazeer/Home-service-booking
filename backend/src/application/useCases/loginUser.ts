import { UserRepository } from "../../domain/repositories/userRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser=async (userRepository: UserRepository, email:string, password:string): Promise<string> => {
    const user = await userRepository.findByEmail(email)
    if(!user) throw new Error("Invalid Email or Password")
        const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid) throw new Error("Invalid Password")
        const token=jwt.sign({email:user.email,role:"user"},process.env.JWT_SECRET_KEY as string,{expiresIn:"1d"})
        return token
}