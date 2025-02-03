import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { UserRepository } from '../../domain/repositories/userRepository';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/UserRepositoryImpl';
import moment from 'moment';
import { WalletRepository } from '../../domain/repositories/walletRepository';
import { WalletRepositoryImpl } from '../../infrastructure/database/repositories/WalletRepositoryImpl';

export class AdminService {
    private userRepository: UserRepository;
    private walletRepository : WalletRepository;

    constructor() {
        this.userRepository = new UserRepositoryImpl();
        this.walletRepository = new WalletRepositoryImpl();
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
    // public async getRevenueAndBookings(filter: string, specificDate?: string) {
    //     let startDate;
    //     let endDate = new Date(); 

    //     switch (filter) {
    //         case "daily":
    //             startDate = moment().startOf("day").toDate();
    //             endDate = moment().endOf("day").toDate();
    //             break;

    //         case "weekly":
    //             startDate = moment().subtract(6, "days").startOf("day").toDate();
    //             break;

    //         case "monthly":
    //             startDate = moment().startOf("year").toDate();
    //             break;

    //         case "yearly":
    //             startDate = moment().subtract(1, "year").startOf("year").toDate();
    //             endDate = moment().endOf("year").toDate();
    //             break;

    //         case "specific":
    //             if (!specificDate) {
    //                 throw new Error("Specific date is required");
    //             }
    //             startDate = moment(specificDate).startOf("day").toDate();
    //             endDate = moment(specificDate).endOf("day").toDate();
    //             break;

    //         default:
    //             throw new Error("Invalid filter");
    //     }

    //     const revenue = await this.walletRepository.getAdminRevenue(startDate, endDate);

    //     if (filter === "monthly") {
    //         const monthlyRevenue = [];
    //         for (let i = 0; i < 12; i++) {
    //             const monthStart = moment().month(i).startOf("month").toDate();
    //             const monthEnd = moment().month(i).endOf("month").toDate();
    //             const revenueForMonth = await this.walletRepository.getAdminRevenue(monthStart, monthEnd);
    //             monthlyRevenue.push({ month: moment().month(i).format("MMMM"), revenue: revenueForMonth });
    //         }
    //         return { monthlyRevenue };
    //     }

    //     return { revenue };
    // }
}
