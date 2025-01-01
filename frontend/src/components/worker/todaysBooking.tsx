'use client'

import { useState, useEffect } from 'react'
import { todaysBooking } from '../../services/workerService'
import { refreshAccessToken } from '../../utils/auth'
import { useNavigate } from 'react-router-dom'

interface WorkLocation {
  address: string
  latitude: number
  longitude: number
}

interface Booking {
  _id: string
  bookingId: string
  workerId: string
  userId: string
  date: string
  slotId: string
  workDescription: string
  workerName: string
  serviceImage: string
  serviceName: string
  paymentStatus: string
  workLocation: WorkLocation
}

export default function WorkerTodayBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const workerId = localStorage.getItem('workerId')
  const navigate = useNavigate()
  useEffect(() => {
    const fetchTodayBookings = async () => {
      const refreshToken = localStorage.getItem('refreshToken')
      try {

          if (refreshToken) {
                        const newAccessToken = await refreshAccessToken();
                        if (!newAccessToken) {
                          console.log('Failed to refresh token, redirecting to login...');
                        
                          return navigate( '/login');
                        }
                      } else {
                        console.log('No refresh token found, redirecting to login...');
                     
                        return navigate('/login');
                      }
                      
        if(!workerId) {
            throw new Error ('invalied workerId')
        }
       
      const data = await todaysBooking(workerId)
       
        setBookings(data.bookings)
      } catch (err) {
        setError('Failed to load today\'s bookings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodayBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
          <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
              role="alert"
          >
              <p className="font-bold">Error</p>
              <p>{error}</p>
          </div>
      </div>
  );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold  mb-4">Today's Works</h1>
      {bookings.length === 0 ? (
        <p className="text-center text-white">No bookings for today.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3  ">
          {bookings.map((booking) => (
            <div key={booking._id} className="border-gray-600 border rounded-lg p-4 shadow-sm  bg-gray-900">
              <div className="flex items-center mb-2">
                <img src={booking.serviceImage} alt={booking.serviceName} className="w-10 h-10 rounded-full mr-2 text-white" />
                <h2 className="text-lg font-semibold  text-white">{booking.serviceName}</h2>
              </div>
              <p className=' text-white'><strong>Booking ID:</strong> {booking.bookingId}</p>
              <p className=' text-white'><strong>Time Slot:</strong> {booking.slotId}</p>
              <p className=' text-white'><strong>Description:</strong> {booking.workDescription}</p>
              <p className=' text-white'><strong>Address:</strong> {booking.workLocation.address}</p>
              <p className={`mt-2 font-semibold ${
                booking.paymentStatus === 'Cancelled' ? 'text-red-500' :
                booking.paymentStatus === 'Pending' ? 'text-yellow-500' : 'text-green-500'
              }`}>
                Status: {booking.paymentStatus}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

