'use client'

import { useState, useEffect } from 'react'
import { todaysBooking } from '../../services/workerService'

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
  useEffect(() => {
    const fetchTodayBookings = async () => {
      try {
        if(!workerId) {
            throw new Error ('invalied workerId')
        }
        // In a real application, you would get the workerId from authentication or context
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold  mb-4">Today's Works</h1>
      {bookings.length === 0 ? (
        <p className="text-center text-white">No bookings for today.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3  ">
          {bookings.map((booking) => (
            <div key={booking._id} className="border-gray-950 border rounded-lg p-4 shadow-sm  bg-gray-600">
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

