import { WorkerRepository } from "../../domain/repositories/workerRepository";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export const loginWorker = async (workerRepository:WorkerRepository, email:string , password:string): Promise <string> => {
    console.log("password", password)
    console.log("email", email)
    const user = await workerRepository.findByEmail(email)
    if(!user) throw new Error ('Invalied Email Or Password')
        const isPasswordValid = await bcrypt.compare(password , user.password)
    if(!isPasswordValid) throw new Error ('Invalied Password')
        const token = jwt.sign({
    email:user.email,
    role:'worker'
    }, process.env.JWT_SECRET_KEY as string,
    { expiresIn :'1d'}
)
return token
}