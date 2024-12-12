import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/userRepository";
import bcrypt from 'bcrypt'

export const registerUser = async(userRepository: UserRepository, userData : User):Promise<User> => {
    const  existingUser = await userRepository.findByEmail(userData.email)
    if(existingUser) throw new Error('email already exist')
        const hashedPassword = await bcrypt.hash(userData.password , 10)
       userData.password = hashedPassword
       return userRepository.createUser(userData)

}