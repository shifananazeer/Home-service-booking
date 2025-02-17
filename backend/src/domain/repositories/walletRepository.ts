import { Wallet } from "../entities/Wallet";

export interface WalletRepository {
    findWalletByUserId(userId: string): Promise<Wallet | null>;
    findAdminWallet(): Promise<Wallet | null>;
    createWallet(userId: string | null, balance: number, isAdmin: boolean, transactionDetails: any): Promise<Wallet>;
    createAdminWallet(amount: number, transactionDetails: any): Promise<Wallet>;
    updateOrCreateWallet(userId: string | null, amount: number, transactionDetails: any, isAdmin: boolean): Promise<Wallet>;
    getRevenueByWorker(workerId: string , timeFrame: string):Promise<{ _id: string, totalRevenue: number }[]> ; 
    getworkerWallet(workerId:string) : Promise<Wallet|null>;
    // getAdminRevenue(startDate: Date, endDate: Date): Promise<number>;
    getRevenueByAdmin( timeFrame: string):Promise<{ _id: string, totalRevenue: number }[]> ; 
}
