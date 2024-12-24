import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { createService, fetchServices, updateService, deleteService } from "../../services/adminService";
import ServiceModal from "./ServiceModel";
import Swal from 'sweetalert2';

export interface Service {
    _id?: string;
    name: string;
    description: string;
    image: string;
}

export default function ServiceManagement() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [limit] = useState<number>(5);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    useEffect(() => {
        const loadServices = async () => {
            try {
                setLoading(true);
                const data = await fetchServices(currentPage, limit, searchQuery);
                setServices(data.services || []);
                setTotalPages(data.totalPages || 1);
            } catch (error) {
                console.error("Error fetching services:", error);
                setError("Failed to fetch services. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadServices();
    }, [currentPage, searchQuery, limit]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (service?: Service) => {
        setSelectedService(service || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    const handleSubmit = async (formData: FormData) => {
      try {
          // Append the image if it exists
          if (selectedService && selectedService.image) {
              formData.append("image", selectedService.image);
          }
          
          if (selectedService) {
              await updateService(selectedService._id!, formData);
          } else {
              await createService(formData);
          }
  
          // Reload services after successful create/update
          const data = await fetchServices(currentPage, limit, searchQuery);
          setServices(data.services || []);
          setTotalPages(data.totalPages || 1);
      } catch (error) {
          console.error("Error saving service:", error);
          setError("Failed to save service. Please try again.");
      } finally {
          handleCloseModal(); // Close the modal after saving
      }
  };

const handleDelete = async (serviceId: string) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone. The service will be permanently deleted.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
        try {
            await deleteService(serviceId);
            // Reload services after delete
            const data = await fetchServices(currentPage, limit, searchQuery);
            setServices(data.services || []);
            setTotalPages(data.totalPages || 1);

            Swal.fire(
                'Deleted!',
                'The service has been successfully deleted.',
                'success'
            );
        } catch (error) {
            console.error("Error deleting service:", error);

            Swal.fire(
                'Error!',
                'Failed to delete the service. Please try again later.',
                'error'
            );

            setError("Failed to delete service. Please try again.");
        }
    }
};


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading Services...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Service
                    </button>
                </div>

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

                <div className="space-y-6">
                    {services.map((service) => (
                        <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="flex">
                                <div className="w-1/4">
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.svg?height=200&width=300";
                                        }}
                                    />
                                </div>
                                <div className="p-4 w-3/4">
                                    <h2 className="text-lg font-semibold">{service.name}</h2>
                                    <p className="text-gray-600">{service.description}</p>
                                    <div className="mt-4 flex justify-between">
                                        <button onClick={() => handleOpenModal(service)} className="text-blue-500 hover:underline">
                                            <PencilIcon className="inline-block w-5 h-5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(service._id!)} className="text-red-500 hover:underline">
                                            <TrashIcon className="inline-block w-5 h-5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <nav>
                        <ul className="flex">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <li key={index} className="mx-1">
                                    <button
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`py-2 px-4 rounded-lg ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Modal for Creating and Editing Service */}
            <ServiceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={selectedService || undefined}
            />
        </div>
    );
}
