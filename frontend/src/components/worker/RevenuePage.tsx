import type React from "react"
import { useState, useEffect } from "react"
import {
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
} from "date-fns"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { getBookings } from "../../services/workerService"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Booking {
  _id: string
  bookingId: string
  date: string
  totalPayment: number
  serviceName: string
  workStatus: string
}

const RevenueAnalyticsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const workerId = localStorage.getItem("workerId")
        if (!workerId) {
          throw new Error("Worker ID not found")
        }
        const response = await getBookings(workerId, currentPage, 10)
        setBookings(response.data.bookings)
        setTotalPages(Math.ceil(response.data.total / 10))
      } catch (err) {
        setError("Failed to fetch bookings. Please try again later.")
        console.error("Error fetching bookings:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [currentPage, timeFrame, getBookings]) // Added getBookings to dependencies

  const calculateRevenue = (start: Date, end: Date) => {
    return bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date)
        return isWithinInterval(bookingDate, { start, end })
      })
      .reduce((sum, booking) => sum + booking.totalPayment, 0)
  }

  const getChartData = () => {
    const now = new Date()
    let start: Date
    let end: Date
    let dateFormat: string

    switch (timeFrame) {
      case "daily":
        start = startOfDay(now)
        end = endOfDay(now)
        dateFormat = "HH:mm"
        break
      case "weekly":
        start = startOfWeek(now)
        end = endOfWeek(now)
        dateFormat = "EEE"
        break
      case "monthly":
        start = startOfMonth(now)
        end = endOfMonth(now)
        dateFormat = "d"
        break
      case "yearly":
        start = startOfYear(now)
        end = endOfYear(now)
        dateFormat = "MMM"
        break
    }

    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date)
      return isWithinInterval(bookingDate, { start, end })
    })

    const labels = []
    const data = []
    let currentDate = start

    while (currentDate <= end) {
      labels.push(format(currentDate, dateFormat))
      const dayRevenue = filteredBookings
        .filter((booking) => {
          const bookingDate = new Date(booking.date)
          return isWithinInterval(bookingDate, { start: currentDate, end: endOfDay(currentDate) })
        })
        .reduce((sum, booking) => sum + booking.totalPayment, 0)
      data.push(dayRevenue)
      currentDate = new Date(currentDate.getTime() + 86400000) // +1 day
    }

    return { labels, data }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  }

  const { labels, data } = getChartData()

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  const now = new Date()
  const dailyRevenue = calculateRevenue(startOfDay(now), endOfDay(now))
  const weeklyRevenue = calculateRevenue(startOfWeek(now), endOfWeek(now))
  const monthlyRevenue = calculateRevenue(startOfMonth(now), endOfMonth(now))
  const yearlyRevenue = calculateRevenue(startOfYear(now), endOfYear(now))

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Revenue Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: "Daily Revenue", amount: dailyRevenue },
              { title: "Weekly Revenue", amount: weeklyRevenue },
              { title: "Monthly Revenue", amount: monthlyRevenue },
              { title: "Yearly Revenue", amount: yearlyRevenue },
            ].map((item, index) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">₹{item.amount.toFixed(2)}</dd>
              </div>
            ))}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-8 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Revenue Chart</h2>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value as "daily" | "weekly" | "monthly" | "yearly")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-64">
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <li key={booking._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-indigo-600 truncate">{booking.serviceName}</p>
                        <p className="text-sm text-gray-500">{format(new Date(booking.date), "PPP")}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium text-gray-900">₹{booking.totalPayment.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{booking.workStatus}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueAnalyticsPage

