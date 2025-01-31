import type React from "react"
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ChartData {
  labels: string[]
  data: number[]
}

const RevenueChart: React.FC<{ data: ChartData }> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Revenue",
        data: data.data,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  return <Line data={chartData} />
}

export default RevenueChart

