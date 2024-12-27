import { WorkerRepository } from "../../domain/repositories/workerRepository";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export const loginWorker = async (workerRepository:WorkerRepository, email:string , password:string): Promise <{ accessToken: string; refreshToken: string; workerId: string }> => {
    console.log("password", password)
    console.log("email", email)
    const user = await workerRepository.findByEmail(email)
    if(!user) throw new Error ('Invalied Email Or Password')
        const isPasswordValid = await bcrypt.compare(password , user.password)
    if(!isPasswordValid) throw new Error ('Invalied Password')
        const accessToken = jwt.sign(
            { email: user.email, role: user.role  },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' } 
        );
    
        const refreshToken = jwt.sign(
            { email: user.email, role: user.role  },
            process.env.REFRESH_TOKEN_SECRET as string, 
            { expiresIn: '7d' }
        );
    
        return { accessToken, refreshToken ,workerId: user._id.toString() };
}