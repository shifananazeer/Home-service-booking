import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getWalletDetails } from '../../services/adminService';
import { FaWallet } from 'react-icons/fa';

interface Transaction {
  _id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  relatedBookingId: string;
  date: string;
}

interface WalletData {
  _id: string;
  balance: number;
  transactions: Transaction[];
}

const AdminWallet: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        // Replace this with your actual API call
        const wallet = await getWalletDetails();
       
        setWalletData(wallet);
      } catch (err) {
        setError('An error occurred while fetching wallet data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">Loading wallet data...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!walletData) {
    return <div className="text-center py-10">No wallet data available</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold text-center mb-4 flex items-center justify-center blink">Admin Wallet <FaWallet className="text-3xl ml-2" /></h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Current Balance</h2>
        <p className="text-4xl font-bold text-green-600">₹{walletData.balance.toFixed(2)}</p>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Booking ID</th>
              </tr>
            </thead>
            <tbody>
              {walletData.transactions.map((transaction) => (
                <tr key={transaction._id} className="border-b">
                  <td className="px-4 py-2">{format(new Date(transaction.date), 'yyyy-MM-dd HH:mm')}</td>
                  <td className="px-4 py-2">{transaction.description}</td>
                  <td className="px-4 py-2">₹{transaction.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded ${
                      transaction.type === 'credit' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">{transaction.relatedBookingId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWallet;
