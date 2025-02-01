import { Types } from "mongoose";
import { Wallet } from "../../domain/entities/Wallet";
import { WalletRepository } from "../../domain/repositories/walletRepository";
import { WalletRepositoryImpl } from "../../infrastructure/database/repositories/WalletRepositoryImpl";

export class WalletService {
    private walletRepository : WalletRepository;
    constructor() {
        this.walletRepository = new WalletRepositoryImpl()
    }

   
    // Update worker wallet
  async workerWallet(userId: string, amount: number, transactionDetails: any): Promise<Wallet> {
    console.log("workerWallet service")
    return await this.walletRepository.updateOrCreateWallet(userId, amount, transactionDetails, false)
  }

  // Find the admin wallet
  async getAdminWallet(): Promise<Wallet | null> {
    return await this.walletRepository.findAdminWallet()
  }

  // Create the admin wallet if it doesn't exist
  async createAdminWallet(amount: number, transactionDetails: any): Promise<Wallet> {
    return await this.walletRepository.createAdminWallet(amount, transactionDetails)
  }

  // Update existing admin wallet
  async updateAdminWallet(amount: number, transactionDetails: any): Promise<Wallet> {
    return await this.walletRepository.updateOrCreateWallet(null, amount, transactionDetails, true)
  }

  async getWorkerRevenue(workerId: string, timeFrame: string): Promise<{ label: string; revenue: number }[]> {
    const rawRevenueData = await this.walletRepository.getRevenueByWorker(workerId, timeFrame);

    if (timeFrame === 'weekly') {
        const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        // Get current week start (Sunday) and map to correct revenue data
        const weeklyRevenueData = dayLabels.map((label, index) => {
            const dayRevenueData = rawRevenueData.find((data) => Number(data._id) === index + 1);

            return {
                label: label,
                revenue: dayRevenueData ? dayRevenueData.totalRevenue : 0, // Default to 0 if no data
            };
        });

        return weeklyRevenueData;
    }

    if (timeFrame === 'monthly') {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Create a map of revenue data
        const revenueMap = rawRevenueData.reduce((acc, data) => {
            acc[Number(data._id) - 1] = data.totalRevenue; // Convert month index (1-12) to array index (0-11)
            return acc;
        }, {} as Record<number, number>);

        // Ensure all 12 months are included
        const fullRevenueData = monthNames.map((month, index) => ({
            label: month,
            revenue: revenueMap[index] || 0, // Default 0 if no data for the month
        }));

        return fullRevenueData;
    }

    if (timeFrame === 'yearly') {
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 2, currentYear - 1, currentYear]; // Last 2 years + current year

        // Create a map of revenue data for years
        const revenueMap = rawRevenueData.reduce((acc, data) => {
            acc[Number(data._id)] = data.totalRevenue;
            return acc;
        }, {} as Record<number, number>);

        const fullRevenueData = years.map((year) => ({
            label: year.toString(),
            revenue: revenueMap[year] || 0,
        }));

        return fullRevenueData;
    }

    return [];
}

async getWalletDetails(workerId:string) {
  const wallet = await this.walletRepository.getworkerWallet(workerId)
  console.log("wallet" , wallet)
  return wallet;
}
}