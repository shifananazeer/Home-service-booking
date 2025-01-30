import { Types } from "mongoose";
import { WalletRepository } from "../../../domain/repositories/walletRepository";
import WalletModel, { WalletDocument } from "../models/walletModel"; // ✅ Use WalletDocument
import { Wallet } from "../../../domain/entities/Wallet";

export class WalletRepositoryImpl implements WalletRepository {
   // Find Worker Wallet
   async findWalletByUserId(userId: string): Promise<Wallet | null> {
    return await WalletModel.findOne({ userId }).lean()
  }

  // Find Admin Wallet
  async findAdminWallet(): Promise<Wallet | null> {
    return await WalletModel.findOne({ isAdmin: true }).lean()
  }

  // Create a new Wallet
  async createWallet(
    userId: string | null,
    balance: number,
    isAdmin: boolean,
    transactionDetails: any,
  ): Promise<Wallet> {
    const newWallet = new WalletModel({
      userId,
      balance,
      transactions: [{ ...transactionDetails, amount: balance }],
      isAdmin,
    })
    await newWallet.save()
    return newWallet.toObject()
  }

  // Create Admin Wallet
  async createAdminWallet(amount: number, transactionDetails: any): Promise<Wallet> {
    return await this.createWallet(null, amount, true, transactionDetails)
  }

  // Update or Create Wallet
  async updateOrCreateWallet(
    userId: string | null,
    amount: number,
    transactionDetails: any,
    isAdmin: boolean,
  ): Promise<Wallet> {
    const wallet = isAdmin ? await WalletModel.findOne({ isAdmin: true }) : await WalletModel.findOne({ userId })
    console.log("wallet", wallet)

    if (wallet) {
      wallet.balance += amount
      wallet.transactions.push(transactionDetails)
      await wallet.save()
      return wallet.toObject()
    } else {
      const createdWallet = await this.createWallet(userId, amount, isAdmin, transactionDetails)
      console.log("createdWallet", createdWallet)
      return createdWallet
    }
  }
  async getRevenueByWorker(workerId: string, timeFrame: string): Promise<{ _id: string; totalRevenue: number }[]> {
    console.log(`Fetching revenue for workerId: ${workerId} with timeFrame: ${timeFrame}`);

    const matchCriteria: any = {
        userId: new Types.ObjectId(workerId),
        "transactions.type": "credit",
    };

    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;

    // Set date range based on time frame
    if (timeFrame === 'monthly') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        matchCriteria["transactions.date"] = { $gte: startDate, $lte: endDate };
    } else if (timeFrame === 'weekly') {
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 6);
        matchCriteria["transactions.date"] = { $gte: startDate };
    } else if (timeFrame === 'yearly') {
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear() + 1, 0, 0);
        matchCriteria["transactions.date"] = { $gte: startDate, $lte: endDate };
    }

    const results = await WalletModel.aggregate([
        { $match: matchCriteria },
        { $unwind: "$transactions" },
        {
            $group: {
                _id: timeFrame === 'weekly' ? { $dateToString: { format: "%Y-%m-%d", date: "$transactions.date" } } :
                    timeFrame === 'monthly' ? { $month: "$transactions.date" } :
                    { $year: "$transactions.date" },
                totalRevenue: { $sum: "$transactions.amount" },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return results.map(item => ({
        _id: item._id as string,  // Ensure _id is treated as a string
        totalRevenue: item.totalRevenue,
    }));
}
}
