// import { useEffect, useState } from "react"
// import { Line } from "react-chartjs-2"
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js"
// import { fetchRevenue } from "../../services/adminService"

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// // Define Type for Chart Data
// interface ChartDataType {
//   labels: string[]
//   datasets: {
//     label: string
//     data: number[]
//     borderColor: string
//     backgroundColor: string
//     tension: number
//   }[]
// }

// // Define Type for Revenue Data
// interface RevenueDataType {
//   month: string
//   revenue: number
// }

// const RevenueChart = () => {
//   const [chartData, setChartData] = useState<ChartDataType>({
//     labels: [],
//     datasets: [],
//   })

//   useEffect(() => {
//     fetchRevenueData()
//   }, [])

//   const fetchRevenueData = async () => {
//     try {
//       const response = await fetchRevenue("monthly")
//       const monthlyRevenue: RevenueDataType[] = response.data.data.monthlyRevenue

//       const labels = monthlyRevenue.map((item) => item.month)
//       const values = monthlyRevenue.map((item) => item.revenue)

//       setChartData({
//         labels,
//         datasets: [
//           {
//             label: "Monthly Revenue",
//             data: values,
//             borderColor: "rgba(75, 192, 192, 1)",
//             backgroundColor: "rgba(75, 192, 192, 0.2)",
//             tension: 0.3,
//           },
//         ],
//       })
//     } catch (error) {
//       console.error("Error fetching revenue data:", error)
//     }
//   }

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-4">Monthly Revenue Trends</h2>

//       {/* Render Chart */}
//       <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
//     </div>
//   )
// }

// export default RevenueChart

