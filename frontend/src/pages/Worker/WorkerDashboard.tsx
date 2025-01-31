import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import WorkerNavbar from "./WorkerNavbar"
import WorkerSidebar from "./WorkerSidebar"
import WorkerProfile from "../../components/worker/WorkerProfile"
import AvailabilityManagement from "../../components/worker/AvailabilityManagement"
import WorkerBookings from "../../components/worker/bookings"
import WorkerTodayBookings from "../../components/worker/todaysBooking"
import ChatList from "../../components/worker/ChatList"
import { getWorkerRatings, getBookingsData, getRevenueData } from "../../services/workerService"
import RevenueChart from "../../components/worker/RevenueChart"
import BookingCountChart from "../../components/worker/BookingsCountChart"
import WorkerRatingsAndReviews from "../../components/worker/RatingsandReview"
import WorkerWalletPage from "../../components/worker/WalletAndRevenue"
import RevenueAnalyticsPage from "../../components/worker/RevenuePage"
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
} from "date-fns"

interface Review {
  userId: { _id: string; firstName: string; lastName: string }
  review: string
  bookingId: string
  userName: string
}

interface RatingsAndReviews {
  ratings: number[]
  reviews: Review[]
}

interface ChartData {
  labels: string[]
  data: number[]
}

const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [revenueData, setRevenueData] = useState<ChartData>({ labels: [], data: [] })
  const [bookingData, setBookingData] = useState<ChartData>({ labels: [], data: [] })
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const [currentComponent, setCurrentComponent] = useState("dashboard")
  const [ratingsAndReviews, setRatingsAndReviews] = useState<RatingsAndReviews>({ ratings: [], reviews: [] })

  const workerId = localStorage.getItem("workerId")

  useEffect(() => {
    const accessToken = localStorage.getItem("worker_accessToken")
    if (!accessToken) {
      navigate("/worker/login")
    }
  }, [navigate])

  useEffect(() => {
    const fetchData = async () => {
      if (!workerId) return

      try {
        const now = new Date()
        let start: Date
        let end: Date

        switch (timeFrame) {
          case "daily":
            start = startOfDay(now)
            end = endOfDay(now)
            break
          case "weekly":
            start = startOfWeek(now)
            end = endOfWeek(now)
            break
          case "monthly":
            start = startOfMonth(now)
            end = endOfMonth(now)
            break
          case "yearly":
            start = startOfYear(now)
            end = endOfYear(now)
            break
        }

        const revenue = await getRevenueData(workerId, start, end)
        setRevenueData(revenue)
        const bookings = await getBookingsData(workerId, start, end)
        setBookingData(bookings)

        const ratings = await getWorkerRatings(workerId)
        setRatingsAndReviews(ratings)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [workerId, timeFrame])

  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFrame(e.target.value as "daily" | "weekly" | "monthly" | "yearly")
  }

  const renderComponent = () => {
    switch (currentComponent) {
      case "profile":
        return <WorkerProfile />
      case "availabilityManagement":
        return <AvailabilityManagement />
      case "workerBookings":
        return <WorkerBookings />
      case "todaysBooking":
        return <WorkerTodayBookings />
      case "chats":
        return <ChatList />
      case "walletAndRevenue":
        return <WorkerWalletPage />
      case "revenue":
        return <RevenueAnalyticsPage />
      case "dashboard":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Worker Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome to your Worker dashboard!</p>
            <div className="flex items-center space-x-4">
              <label htmlFor="timeframe" className="text-sm font-medium text-gray-700">
                Select Timeframe:
              </label>
              <select
                id="timeframe"
                onChange={handleTimeFrameChange}
                value={timeFrame}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Revenue</h2>
                <RevenueChart data={revenueData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Booking Count</h2>
                <BookingCountChart data={bookingData} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <WorkerRatingsAndReviews ratings={ratingsAndReviews.ratings} reviews={ratingsAndReviews.reviews} />
            </div>
          </div>
        )
      default:
        return <h1 className="text-2xl font-bold">Component Not Found</h1>
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <WorkerNavbar />
      <div className="flex flex-1 overflow-hidden">
        <WorkerSidebar setCurrentComponent={setCurrentComponent} />
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6"
          style={{ marginLeft: "16rem", marginTop: "4rem" }}
        >
          {renderComponent()}
        </main>
      </div>
    </div>
  )
}

export default WorkerDashboard

