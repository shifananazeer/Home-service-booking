import type React from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ChartData {
  labels: string[]
  data: number[]
}

const BookingCountChart: React.FC<{ data: ChartData }> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Booking Count",
        data: data.data,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  }

  return <Bar data={chartData} />
}

export default BookingCountChart

