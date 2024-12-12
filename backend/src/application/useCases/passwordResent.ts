import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl"
import { UserRepository } from "../../domain/repositories/userRepository";
import { User } from "../../domain/entities/User";
import jwt from 'jsonwebtoken'
import { sendResetEmail } from "../../infrastructure/services/passwordEmail";
export const sendResetLink = async (email:string) : Promise<void> => {
    const user = await UserRepositoryImpl.findByEmail(email);
    if(!user) {
        throw new Error ('User not Fount')
    }
    const resetToken = generateResetToken(user);
    await sendResetEmail(user.email, resetToken);
}


const generateResetToken = (user : User) : string => {
    const token = jwt.sign({
        email:user.email,
         role:"user"
    },process.env.JWT_SECRET_KEY as string , 
    {expiresIn:"1d"}
)
return token;
}
