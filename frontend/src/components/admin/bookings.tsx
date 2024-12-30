'use client'

import { useState, useEffect } from 'react'
import { fetchAllBookings } from '../../services/adminService'

interface Booking {
  _id: string
  bookingId: string
  workerId: string
  userId: {
    _id: string
    email: string
  }
  date: string
  slotId: string
  workDescription: string
  workerName: string
  serviceImage: string
  serviceName: string
  paymentStatus: string
  workLocation: {
    address: string
    latitude: number
    longitude: number
  }
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await fetchAllBookings() // Adjust this URL to your actual API endpoint
       
        
        setBookings(data.bookings)
      } catch (err) {
        setError('Failed to load bookings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Bookings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Booking ID</th>
              <th className="px-4 py-2 text-left">User Email</th>
              <th className="px-4 py-2 text-left">Worker Name</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Slot</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b">
                <td className="px-4 py-2">{booking.bookingId}</td>
                <td className="px-4 py-2">{booking.userId.email}</td>
                <td className="px-4 py-2">{booking.workerName}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <img src={booking.serviceImage} alt={booking.serviceName} className="w-8 h-8 mr-2 rounded-full" />
                    {booking.serviceName}
                  </div>
                </td>
                <td className="px-4 py-2">{new Date(booking.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{booking.slotId}</td>
                <td className="px-4 py-2">{booking.workLocation.address}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded ${
                    booking.paymentStatus === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

