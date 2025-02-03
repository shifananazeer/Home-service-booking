import type React from "react"
import { useState, useEffect } from "react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useNavigate } from "react-router-dom"
import UserManagement from "../../components/admin/UserManagement"
import WorkerManagement from "../../components/admin/WorkerManagement"
import ServiceManagement from "../../components/admin/ServiceManagement"
import AdminBookings from "../../components/admin/bookings"
import { getPopular, getTopWorkers, numberOfBookings, revenueForAdmin } from "../../services/adminService"
import RevenueChart from "../../components/worker/RevenueChart"
import BookingCountChart from "../../components/worker/BookingsCountChart"
import SkillPieChart from "../../components/worker/SkillPieChart"
import TopWorker from "../../components/admin/TopWorkers"
import AdminWallet from "../../components/admin/AdminWallet"


const AdminDashboard = () => {
  const navigate = useNavigate()
  const adminId = localStorage.getItem("admin_Id")
  const [currentComponent, setCurrentComponent] = useState("dashboard")
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly" | "yearly">("monthly")
  const [revenueData, setRevenueData] = useState<{ label: string; revenue: number }[]>([])
  const [bookingData, setBookingData] = useState<{ label: string; count: number }[]>([])
  const [bookedService, setBookedService] = useState<{ skill: string; count: number }[]>([])
  const [topWorker, setTopWorker] = useState<any>(null)

  useEffect(() => {
    if (!adminId) {
      navigate("/admin/login")
    }
  }, [navigate, adminId]) // Added adminId to dependencies

  useEffect(() => {
    const fetchData = async () => {
      if (!adminId) return
      try {
        const revenue = await revenueForAdmin(timeFrame)
        setRevenueData(revenue.revenue)
        const bookings = await numberOfBookings(timeFrame)
        setBookingData(bookings)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    const fetchService = async () => {
      try {
        const popularService = await getPopular()
        setBookedService(popularService.data)
      } catch (error) {
        console.error("Error fetching popular services:", error)
      }
    }

    const fetchTopWorkers = async () => {
      try {
        const topWorkersData = await getTopWorkers()
        if (topWorkersData.data && topWorkersData.data.length > 0) {
          setTopWorker(topWorkersData.data[0])
        }
      } catch (error) {
        console.error("Error fetching top workers:", error)
      }
    }

    fetchData()
    fetchService()
    fetchTopWorkers()
  }, [timeFrame, adminId]) // Added adminId to dependencies

  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFrame(e.target.value as "weekly" | "monthly" | "yearly")
  }

  const renderComponent = () => {
    switch (currentComponent) {
      case "userManagement":
        return <UserManagement />
      case "workerManagement":
        return <WorkerManagement />
      case "serviceManagement":
        return <ServiceManagement />
      case "bookings":
        return <AdminBookings />
      case 'wallet':
        return <AdminWallet/>
      case "dashboard":
        return (
          <>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <SkillPieChart data={bookedService} />
              {topWorker && <TopWorker worker={topWorker} />}
            </div>
          </>
        )
      default:
        return <h1 className="text-2xl font-bold">Component Not Found</h1>
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar setCurrentComponent={setCurrentComponent} />
        <div className="flex-1 p-6 bg-gray-100" style={{ marginLeft: "16rem", marginTop: "4rem" }}>
          {renderComponent()}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

