import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { getWalletDetails } from "../../services/workerService"


interface Transaction {
  amount: number
  type: "credit" | "debit"
  description: string
  relatedBookingId: string
  _id: string
  date: string
}

interface WalletData {
  _id: string
  userId: string
  balance: number
  transactions: Transaction[]
  isAdmin: boolean
}

const WorkerWalletPage: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const workerId = localStorage.getItem("workerId") // Assuming you store workerId in localStorage
        if (!workerId) {
          throw new Error("Worker ID not found")
        }
        const data = await getWalletDetails(workerId)
        setWalletData(data)
      } catch (err) {
        setError("Failed to fetch wallet details. Please try again later.")
        console.error("Error fetching wallet details:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  }

  if (!walletData) {
    return <div className="min-h-screen flex items-center justify-center">No wallet data available.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Worker Wallet</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl leading-6 font-medium text-gray-900">Wallet Balance</h2>
            <p className="mt-1 max-w-2xl text-3xl font-bold text-green-600">₹{walletData.balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl leading-6 font-medium text-gray-900">Transaction History</h2>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {walletData.transactions.map((transaction) => (
                <li key={transaction._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{format(new Date(transaction.date), "MMM d, yyyy HH:mm")}</p>
                      <p className="text-xs text-gray-400">Booking ID: {transaction.relatedBookingId}</p>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        transaction.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerWalletPage

