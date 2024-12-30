import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking, fetchingSlots } from '../../services/userService';
import axios from 'axios';
import { refreshAccessToken } from '../../utils/auth';

interface Slot {
    slotId: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

interface Booking {
    date: Date;
    slotId: string;
    workLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
    workDescription: string;
    workerId: string;
    userId: string;
    paymentStatus: string;
    workerName: string;
    serviceImage: string;
    serviceName: string;
}

const BookingConfirm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { workerName, workerPic, workerId, workerRate, serviceName, serviceImage } = location.state || {};

    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [workLocation, setWorkLocation] = useState<string>('');
    const [workDescription, setWorkDescription] = useState<string>('');
      const [isLoading, setIsLoading] = useState(true);
    const userId = localStorage.getItem('user_Id');

    useEffect(() => {
        const initialize = async () => {
          try {
            const refreshToken = localStorage.getItem('refreshToken');
    
            if (refreshToken) {
              const newAccessToken = await refreshAccessToken();
              if (!newAccessToken) {
                console.log('Failed to refresh token, redirecting to login...');
                navigate('/login');
                return;
              }
            } else {
              console.log('No refresh token found, redirecting to login...');
              navigate('/login');
              return;
            }
    
            if (!userId) {
              alert('You need to be logged in to book a service.');
              navigate('/login');
              return;
            }
    
            // Generate available dates
            const today = new Date();
            const dates = Array.from({ length: 8 }, (_, i) => {
              const nextDate = new Date(today);
              nextDate.setDate(today.getDate() + i);
              return nextDate;
            });
    
            setAvailableDates(dates);
          } catch (error) {
            console.error('Error during initialization:', error);
          } finally {
            setIsLoading(false);
          }
        };
    
        initialize();
      }, [userId, navigate]);

    const fetchSlots = async (date: Date, workerId: string) => {
        try {
            const adjustedDate = new Date(date);
            adjustedDate.setDate(adjustedDate.getDate() - 1);

            const response = await fetchingSlots(adjustedDate, workerId);
            const data = response.data;
            setSlots(data.slots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = new Date(event.target.value);
        setSelectedDate(selected);
        fetchSlots(selected, workerId);
    };

    const handleSlotSelection = (slotId: string) => {
        setSelectedSlot(prevSlot => (prevSlot === slotId ? null : slotId));
    };

    const handleBookingSubmit = async () => {
        if (!workLocation || !workDescription || !selectedSlot) {
            alert('Please fill all fields and select a slot.');
            return;
        }
    
        if (!userId) {
            alert('You need to be logged in to book a service.');
            navigate('/login');
            return;
        }
    
        const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const geocodingURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(workLocation)}&key=${API_KEY}`;
        try {
            const response = await axios.get(geocodingURL);
            const data = response.data;
    
            console.log('Geocoding API Response:', data);
    
            if (data.status === 'OK') {
                const location = data.results[0].geometry.location;
                const latitude = location.lat;
                const longitude = location.lng;
    
                const bookingDetails: Booking = {
                    date: selectedDate,
                    slotId: selectedSlot,
                    workLocation: {
                        address: workLocation,
                        latitude,
                        longitude
                    },
                    workDescription,
                    workerId,
                    userId,
                    paymentStatus: 'Pending',
                    workerName,
                    serviceImage,
                    serviceName,
                };
    
                console.log('Booking Details:', bookingDetails);
               console.log("lllll",workLocation)
                // const saveResponse = await createBooking(bookingDetails);
                // console.log('Save Response:', saveResponse);
    
                // if (saveResponse.status === 201) {
                //     alert('Booking created successfully!');
                    navigate('/payment', {
                        state: {
                            bookingDetails: {
                                ...bookingDetails, // Spread bookingDetails to pass all its fields
                            },
                            workerRate
                        },
                    });
                // } else {
                //     alert('Failed to save booking. Please try again.');
                // }
            } else {
                alert('Failed to fetch location details. Please check the address.');
            }
        } catch (error) {
            console.error('Error fetching location details or creating booking:', error);
            alert('An error occurred. Please try again.');
        }
    };
    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
      }
 

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="lg:flex">
                    <div className="lg:w-1/2 bg-gray-900 p-8 flex flex-col justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-4">Book Your Service</h1>
                            <p className="text-xl text-blue-200 mb-8">Complete your booking with {workerName} for {serviceName}</p>
                            <div className="flex items-center space-x-4 mb-8">
                                <img
                                    src={workerPic || '/avatar.jpeg'}
                                    alt="Worker"
                                    className="h-20 w-20 object-cover rounded-full border-4 border-white shadow-lg"
                                />
                                <div>
                                    <h2 className="text-2xl font-semibold text-white">{workerName}</h2>
                                    <p className="text-blue-200">Rate: ${workerRate}/hr</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <img
                                src={serviceImage}
                                alt="Service"
                                className="w-full h-48 object-cover rounded-lg shadow-lg"
                            />
                            <h3 className="text-xl font-semibold text-white mt-4">{serviceName}</h3>
                        </div>
                    </div>
                    <div className="lg:w-1/2 p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Select Date</h2>
                            <select
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={handleDateChange}
                            >
                                {availableDates.map((date, index) => (
                                    <option key={index} value={date.toISOString().split('T')[0]}>
                                        {date.toDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Available Slots</h2>
                            {slots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {slots.map((slot) => (
                                        <label
                                            key={slot.slotId}
                                            className={`flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                                                slot.isAvailable 
                                                    ? selectedSlot === slot.slotId
                                                        ? 'bg-gray-900 text-white border-gray-600'
                                                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-500'
                                                    : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={slot.slotId}
                                                checked={selectedSlot === slot.slotId}
                                                onChange={() => handleSlotSelection(slot.slotId)}
                                                disabled={!slot.isAvailable}
                                                className="hidden"
                                            />
                                            {`${slot.startTime} - ${slot.endTime}`}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No slots available for the selected date.</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Work Location</h2>
                            <input
                                type="text"
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="Enter work location"
                                value={workLocation}
                                onChange={(e) => setWorkLocation(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Work Description</h2>
                            <textarea
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="Enter work description"
                                value={workDescription}
                                onChange={(e) => setWorkDescription(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleBookingSubmit}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirm;
