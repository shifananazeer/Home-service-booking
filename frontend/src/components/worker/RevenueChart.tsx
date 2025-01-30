import type React from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RevenueData {
  month: string
  revenue: number
}

interface RevenueChartProps {
  revenueData: RevenueData[]
}

const RevenueChart: React.FC<RevenueChartProps> = ({ revenueData }) => {
  const data = {
    labels: revenueData.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueData.map((item) => item.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Worker Monthly Revenue",
        font: {
          size: 14,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  }

  return (
    <div className="w-2/4 h-64">
      <Bar data={data} options={options} />
    </div>
  )
}

export default RevenueChart

