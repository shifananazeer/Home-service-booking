import { Types } from "mongoose";
import { WalletRepository } from "../../../domain/repositories/walletRepository";
import WalletModel, { WalletDocument } from "../models/walletModel"; // ✅ Use WalletDocument
import { Wallet } from "../../../domain/entities/Wallet";
import { getIo } from "../../sockets/chatSocket";

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
    const wallet = isAdmin ? await WalletModel.findOne({ isAdmin: true }) : await WalletModel.findOne({ userId });

    console.log("wallet", wallet);

    if (wallet) {
        // Check if a similar transaction already exists
        const existingTransaction = wallet.transactions.find(
            (t) => t.relatedBookingId === transactionDetails.relatedBookingId && t.description === transactionDetails.description
        );

        if (existingTransaction) {
            console.log("Duplicate transaction detected. Skipping...");
            return wallet.toObject(); // Prevent duplicate insertion
        }

        // If no duplicate, proceed with updating the wallet
        wallet.balance += amount;
        wallet.transactions.push(transactionDetails);
        await wallet.save();

        const io = getIo();
        if (userId) {
            io.to(userId).emit("receive-notification", {
                message: `A new wallet has been created for you with an initial balance of: ${amount}`,
                timestamp: new Date().toISOString(),
                transactionDetails,
            });
        }

        return wallet.toObject();
    } else {
        const createdWallet = await this.createWallet(userId, amount, isAdmin, transactionDetails);
        console.log("createdWallet", createdWallet);
        return createdWallet;
    }
}
  async getRevenueByWorker(workerId: string, timeFrame: string): Promise<{ _id: string; totalRevenue: number }[]> {
    console.log(`Fetching revenue for workerId: ${workerId} with timeFrame: ${timeFrame}`);

    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = new Date(); 

    if (timeFrame === 'weekly') {
      
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 6); 
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

    } else if (timeFrame === 'yearly') {
        const currentYear = currentDate.getFullYear();
        startDate = new Date(currentYear - 2, 0, 1); 
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); 

    } else {
       
        const currentYear = currentDate.getFullYear();
        startDate = new Date(currentYear, 0, 1); 
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); 
    }

    const results = await WalletModel.aggregate([
        { $unwind: "$transactions" },
        {
            $match: {
                userId: new Types.ObjectId(workerId),
                "transactions.type": "credit",
                "transactions.date": { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: timeFrame === 'weekly'
                    ? { day: { $dayOfWeek: "$transactions.date" } } 
                    : timeFrame === 'yearly'
                    ? { year: { $year: "$transactions.date" } }  
                    : { month: { $month: "$transactions.date" } }, 
                totalRevenue: { $sum: "$transactions.amount" },
            },
        },
        { $sort: { "_id": 1 } },
    ]);

    return results.map(item => ({
        _id: timeFrame === 'weekly' 
            ? item._id.day.toString()  
            : timeFrame === 'yearly' 
            ? item._id.year.toString()  
            : String(item._id.month).padStart(2, '0'), 
        totalRevenue: item.totalRevenue,
    }));
}

async getworkerWallet(workerId: string): Promise<Wallet|null> {
  const wallet = await WalletModel.findOne({ userId:workerId });
  console.log("Wallet fetched from DB:", wallet);

  // Return null if no wallet is found
  return wallet || null;
}


// async getAdminRevenue(startDate: Date, endDate: Date): Promise<number> {
//   try {
//       // Find the admin wallet (assuming there's only one admin wallet)
//       const adminWallet = await WalletModel.findOne({ userId: null });

//       if (!adminWallet) {
//           return 0; // Return 0 if no admin wallet exists
//       }

//       // Filter transactions within the date range
//       const filteredTransactions = adminWallet.transactions.filter(transaction => {
//           const transactionDate = new Date(transaction.date);
//           return transaction.type === "credit" && transactionDate >= startDate && transactionDate <= endDate;
//       });

//       // Sum up the revenue from the filtered transactions
//       const totalRevenue = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

//       return totalRevenue;
//   } catch (error) {
//       console.error("Error fetching admin revenue:", error);
//       throw new Error("Failed to fetch admin revenue");
//   }
// }

// Get count of bookings within the specified timeframe
// static async getBookingCount(startDate: Date, endDate: Date) {
//   return await Booking.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
// }

async getRevenueByAdmin( timeFrame: string): Promise<{ _id: string; totalRevenue: number }[]> {
 
  const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (timeFrame === "weekly") {
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 6); 
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    } else if (timeFrame === "yearly") {
        const currentYear = currentDate.getFullYear();
        startDate = new Date(currentYear - 2, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    } else {
        const currentYear = currentDate.getFullYear();
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    }

    // ✅ Find Admin Wallet where admin: true
    const adminWallet = await WalletModel.findOne({ isAdmin: true });
    if (!adminWallet) {
        throw new Error("Admin wallet not found.");
    }

    const results = await WalletModel.aggregate([
        { $unwind: "$transactions" },
        {
            $match: {
                _id: new Types.ObjectId(adminWallet._id), // ✅ Match Admin Wallet ID
                "transactions.type": "credit",
                "transactions.date": { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id:
                    timeFrame === "weekly"
                        ? { day: { $dayOfWeek: "$transactions.date" } }
                        : timeFrame === "yearly"
                        ? { year: { $year: "$transactions.date" } }
                        : { month: { $month: "$transactions.date" } },
                totalRevenue: { $sum: "$transactions.amount" },
            },
        },
        { $sort: { "_id": 1 } },
    ]);

    return results.map((item) => ({
        _id:
            timeFrame === "weekly"
                ? item._id.day.toString()
                : timeFrame === "yearly"
                ? item._id.year.toString()
                : String(item._id.month).padStart(2, "0"),
        totalRevenue: item.totalRevenue,
    }));
}

}
