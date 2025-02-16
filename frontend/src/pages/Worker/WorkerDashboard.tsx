import type React from "react"
import { useEffect, useState } from "react"
import WorkerNavbar from "./WorkerNavbar"
import WorkerSidebar from "./WorkerSidebar"
import { useNavigate } from "react-router-dom"
import WorkerProfile from "../../components/worker/WorkerProfile"
import AvailabilityManagement from "../../components/worker/AvailabilityManagement"
import WorkerBookings from "../../components/worker/bookings"
import WorkerTodayBookings from "../../components/worker/todaysBooking"
import ChatList from "../../components/worker/ChatList"
import { getSkillsCount, getWorkerRatings, numberOfBookings, revenueDataForWorker } from "../../services/workerService"
import RevenueChart from "../../components/worker/RevenueChart"
import BookingCountChart from "../../components/worker/BookingsCountChart"
import WorkerRatingsAndReviews from "../../components/worker/RatingsandReview"
import WorkerWalletPage from "../../components/worker/WalletAndRevenue"
import RevenueAnalyticsPage from "../../components/worker/RevenuePage"
import SkillPieChart from "../../components/worker/SkillPieChart"


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

  

const WorkerDashboard = () => {
  const navigate = useNavigate()
  const [revenueData, setRevenueData] = useState<{ label: string; revenue: number }[]>([])
  const [bookingData, setBookingData] = useState<{ label: string; count: number }[]>([])
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly" | "yearly">("monthly")
  const [currentComponent, setCurrentComponent] = useState("dashboard")
  const [ratingsAndReviews, setRatingsAndReviews] = useState<RatingsAndReviews>({ ratings: [], reviews: [] })
  const [bookedSkills, setBookedSkills] = useState<{ skill: string; count: number }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
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
        const revenue = await revenueDataForWorker(workerId, timeFrame)
        setRevenueData(revenue)
        const bookings = await numberOfBookings(workerId, timeFrame)
        setBookingData(bookings)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    const fetchRatingsAndReviews = async () => {
        if (!workerId) return
        try{
     const ratings = await getWorkerRatings(workerId)
     setRatingsAndReviews(ratings)
        }catch (error) {
            console.error("Error fetching ratings and reviews:", error)
        }
    }


    const fetchSkills = async () => {
      if(!workerId) return 
      try{
     const skills = await getSkillsCount (workerId)
     setBookedSkills(skills)
      }catch (error) {

      }
    }
   
    fetchData()
    fetchRatingsAndReviews()
    fetchSkills()
  }, [workerId, timeFrame])

  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFrame(e.target.value as "weekly" | "monthly" | "yearly")
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
        return<WorkerWalletPage/>
      case 'revenue' :
        return <RevenueAnalyticsPage/>  
      case "dashboard":
        return (
          <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Worker Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome to your Worker dashboard!</p>
          <div className="flex items-center space-x-4 mb-6">
            <label htmlFor="timeframe" className="text-sm font-medium text-gray-700">
              Select Timeframe:
            </label>
            <select
              id="timeframe"
              onChange={handleTimeFrameChange}
              value={timeFrame}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2">Revenue</h2>
                <RevenueChart data={revenueData} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Booking Count</h2>
                <BookingCountChart data={bookingData} />
              </div>
              <SkillPieChart data={bookedSkills} />

              <div className="bg-white p-4 rounded-lg shadow-md">
            <WorkerRatingsAndReviews ratings={ratingsAndReviews.ratings} reviews={ratingsAndReviews.reviews} />
          
            </div>
            </div>
          
          
         
            
          </div>
        )
      default:
        return <h1 className="text-2xl font-bold">Component Not Found</h1>
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <WorkerNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
      <WorkerSidebar 
  isOpen={isSidebarOpen} 
  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}  // Add this line
  setCurrentComponent={setCurrentComponent} 
/>
<main
  className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 transition-all ${
    isSidebarOpen ? "ml-64" : "ml-16"
  } pt-16`} // Add pt-16 for top padding
>
  {renderComponent()}
</main>
      </div>
    </div>
  )
}

export default WorkerDashboard

