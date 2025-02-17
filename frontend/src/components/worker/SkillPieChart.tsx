import type React from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

interface SkillPieChartProps {
  data: { skill : string; count: number }[]
  width?: number
  height?: number
}

const SkillPieChart: React.FC<SkillPieChartProps> = ({ data, width = 300, height = 300 }) => {
  const chartData = {
    labels: data.map((item) => item.skill),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Booked Services</h2>
      <div style={{ width, height }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  )
}

export default SkillPieChart

