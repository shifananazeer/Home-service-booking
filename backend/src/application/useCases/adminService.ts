import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { UserRepository } from '../../domain/repositories/userRepository';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/UserRepositoryImpl';

export class AdminService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepositoryImpl();
    }

    public async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; adminId: string , adminEmail:string , adminRole:string }> {
        // Find the admin user by email
        const admin = await this.userRepository.findByEmail(email);

        if (!admin || admin.role !== 'admin') {
            throw new Error('Invalid email or password');
        }

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate Access Token
        const accessToken = jwt.sign(
            {
                sub: admin._id,
                email: admin.email,
                role: admin.role,
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            {
                sub: admin._id,
                email: admin.email,
                role: admin.role,
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        return {
            accessToken,
            refreshToken,
            adminId: admin._id.toString(),
            adminEmail:admin.email,
            adminRole:admin.role
        };
    }
}
