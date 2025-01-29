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

  async getWorkerRevenue(workerId: string): Promise<{ month: string; revenue: number }[]> {
    const rawRevenueData = await this.walletRepository.getRevenueByWorker(workerId);

    // Convert numeric month (_id) to string month name
    const monthNames: string[] = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Map the raw data to the desired format
    return rawRevenueData.map((data: { _id: number; totalRevenue: number }) => ({
        month: monthNames[data._id], // Convert month number to month name
        revenue: data.totalRevenue
    }));
}


}