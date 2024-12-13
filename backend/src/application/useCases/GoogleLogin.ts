import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/userRepository";

interface GoogleUser {
    firstName: string;
    lastName: string;
    email: string;
    googleId: string;
}

export const googleLogin = async (
    userRepository: UserRepository,
    googleUser: GoogleUser
): Promise<User> => {
    let user = await userRepository.findByGoogleId(googleUser.googleId);

    if (!user) {
        user = await userRepository.findByEmail(googleUser.email);
        if (user) {
            throw new Error("Email already registered with another method");
        }

        const newUser: User = {
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            email: googleUser.email,
            googleId: googleUser.googleId,
            isVerified: true,
            mobileNumber: "",
            password: "",
            
        };

        user = await userRepository.createUser(newUser);
    }

    return user;
};
