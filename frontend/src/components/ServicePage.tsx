import { useEffect, useState } from 'react'
import { fetchService } from '../services/workerService'
import { fetchServices } from '../services/adminService'

interface Service {
  id: number
  name: string
  description: string
  image: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [limit] = useState<number>(8);
  useEffect(() => {
    async function loadServices() {
      try {
        const  data = await fetchServices(currentPage , limit , searchQuery);// Replace with your API endpoint
    
        console.log("page................",currentPage , limit)
                setServices(data.services || []);
                setTotalPages(data.totalServices || 1);
                console.log("totalpage", totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services')
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  },[currentPage, searchQuery, limit])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
};

const handlePageChange = (page: number) => {
    console.log("Navigating to page:", page); // Debugging line
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
};

  if (loading) return <div className="text-center p-8">Loading services...</div>
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">What We Offer</h1>
      <p className="text-center text-gray-600 mb-12">
        EXPLORE THE WIDE RANGE OF SERVICES WE PROVIDE TO MEET ALL YOUR NEEDS
      </p>

      <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-150 ease-in-out"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="ml-2 py-2 px-3 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition duration-150 ease-in-out"
                        >
                            &times;
                        </button>
                    )}
                </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-black text-white p-4 rounded-lg">
            <div className="relative h-48 mb-4">
              <img
                src={service.image}
                alt={service.name}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">{service.name}</h3>
            <p className="text-gray-300 text-center text-sm mb-4">{service.description}</p>
            <button 
              className="w-full bg-gray-300 hover:bg-gray-500 text-black py-2 px-4 rounded-lg transition-colors"
              onClick={() => window.location.href = `/book/${service.id}`}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {Math.ceil(totalPages / limit)}</span>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Next
                </button>
                </div>
    </div>
  )
}

