import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { addRatings, cancelBooking, createCheckoutSession, downloadInvoice, fetchBookigs } from "../../services/userService"
import Swal from "sweetalert2"
import { Calendar, Clock, User, Briefcase, X } from "lucide-react"
import RatingModal from "../../components/RatingModel"

interface Booking {
  _id: string
  bookingId: string
  workerName: string
  workerId: string
  serviceName: string
  date: string
  slotId: string
  serviceImage: string
  workDescription: string
  paymentStatus: "pending" | "advance_paid" | "balance_paid" | "cancelled"
  advancePayment?: number
  totalPayment?: number
  balancePayment?: number
  workStatus: string
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [limit, setLimit] = useState<number>(5)
  const navigate = useNavigate()
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const userId = localStorage.getItem("user_Id")
  const [workerId, setWorkerId] = useState<string | null>(null)
  const [ratedBookings, setRatedBookings] = useState<Set<string>>(new Set())

  const parseSlotId = (slotId: string) => {
    const [day, startTime, endTime] = slotId.split("-")
    return { day, startTime, endTime }
  }

  const handleRetryPayment = async (amount: number, bookingId: string) => {
    console.log("amount", amount)
    const checkoutResponse = await createCheckoutSession({
      amount: amount * 100,
      bookingId,
      paymentType: "advance",
      successUrl: `http://localhost:5173/booking-success?bookingId=${bookingId}`,
    })
    if (checkoutResponse.url) {
      // Redirect to the Stripe checkout page
      window.location.href = checkoutResponse.url
    } else {
      Swal.fire("Error", "Failed to create Stripe session", "error")
    }
  }
  useEffect(() => {
    const loadBookings = async () => {
      const userId = localStorage.getItem("user_Id")
      if (!userId) {
        setError("User ID is missing")
        setIsLoading(false)
        return
      }

      try {
        const fetchedData = await fetchBookigs(userId, currentPage, limit)
        console.log("Fetched Bookings:", fetchedData)

        if (fetchedData && fetchedData.bookings && Array.isArray(fetchedData.bookings.bookings)) {
          setBookings(fetchedData.bookings.bookings)
          setTotalPages(Math.ceil(fetchedData.bookings.total / limit))
        } else {
          setError("Invalid data structure received from the server")
        }
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings. Please try again later.")
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [currentPage, limit])

  const handleCancelBooking = async (bookingId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    })

    if (result.isConfirmed) {
      try {
        await cancelBooking(bookingId)

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId ? { ...booking, paymentStatus: "cancelled" } : booking,
          ),
        )

        Swal.fire("Cancelled!", "Your booking has been cancelled.", "success")
      } catch (error) {
        Swal.fire("Error!", "Failed to cancel booking. Please try again.", "error")
      }
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleRatingSubmit = async (rating: number, review: string) => {
    if (selectedBookingId) {
      try {
        const ratingData = {
          bookingId: selectedBookingId,
          userId,
          workerId,
          review,
          rating,
        }
        await addRatings(ratingData)
        Swal.fire("Success", "Rating submitted successfully", "success")
        setIsRatingModalOpen(false)
        setSelectedBookingId(null)
        setRatedBookings((prev) => new Set(prev).add(selectedBookingId))
      } catch (error) {
        console.error("Error submitting rating:", error)
        Swal.fire("Error", "Failed to submit rating. Please try again.", "error")
      }
    }
  }

  const handleDownloadInvoice = async (bookingId:string) => {
    try {
      await downloadInvoice(bookingId);
    } catch (error) {
      alert("Failed to download invoice. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-600 text-center">You have no bookings at the moment.</p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const { day, startTime, endTime } = parseSlotId(booking.slotId)

            return (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left Section: Image */}
                  <div className="w-full md:w-1/4 p-4 flex items-center justify-center bg-gray-50">
                    <img
                      src={booking.serviceImage || "/placeholder.svg"}
                      alt={booking.serviceName}
                      className="object-cover w-32 h-32 rounded-full border-4 border-white shadow"
                    />
                  </div>

                  {/* Middle Section: Details */}
                  <div className="w-full md:w-1/2 p-4">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">{booking.serviceName}</h2>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" /> {booking.workerName}
                    </p>
                    <div className="mb-2">
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" /> {day}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-2" /> {startTime} - {endTime}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" /> {booking.workDescription}
                    </p>
                    <p>advance{booking.advancePayment}</p>
                    <p>balance{booking.balancePayment}</p>
                  </div>

                  {/* Right Section: Status and Actions */}
                  <div className="w-full md:w-1/4 p-4 flex flex-col justify-between items-center bg-gray-50">
                    <span
                      className={`rounded-full text-xs font-semibold px-3 py-1 mb-4 ${
                        booking.paymentStatus === "advance_paid"
                          ? "bg-green-200 text-green-800"
                          : booking.paymentStatus === "pending"
                            ? "bg-yellow-200 text-yellow-800"
                            : booking.paymentStatus === "balance_paid"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-red-200 text-red-800"
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>

                    {booking.paymentStatus === "pending" && (
                      <button
                        onClick={() => handleRetryPayment(booking.advancePayment || 0, booking.bookingId)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v1m0 14v1m8-10h-1m-14 0H4m15.364-4.636l-.707.707M6.343 17.657l-.707.707m13.414 0l-.707-.707m-12.02 0l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Retry Payment
                      </button>
                    )}

                    {booking.paymentStatus !== "cancelled" && booking.paymentStatus !== "balance_paid" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </button>
                    )}

                    {booking.paymentStatus === "balance_paid" &&
                      booking.workStatus === "completed" &&
                      (ratedBookings.has(booking._id) ? (
                        <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-full">Rating Added</span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedBookingId(booking._id)
                            setWorkerId(booking.workerId)
                            setIsRatingModalOpen(true)
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                          Add Ratings
                        </button>
                      ))}

{booking.paymentStatus === "balance_paid" && booking.workStatus === "completed" && (
  <button
    onClick={() => handleDownloadInvoice(booking.bookingId)}
    className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
  >
    Download Invoice
  </button>
)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-8 flex flex-col items-center">
          <div className="flex justify-between items-center w-full max-w-md mb-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Previous
            </button>
            <p className="text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Next
            </button>
          </div>
          <p className="text-gray-600 mb-6">Total Bookings: {bookings.length}</p>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/services")}
          className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-lg font-semibold"
        >
          Book New Service
        </button>
      </div>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false)
          setSelectedBookingId(null)
        }}
        onSubmit={handleRatingSubmit}
        bookingId={selectedBookingId || ""}
      />
    </div>
  )
}

export default BookingList

