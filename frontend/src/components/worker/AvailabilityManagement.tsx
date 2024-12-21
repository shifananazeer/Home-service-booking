import React, { useEffect, useState } from 'react';
import {  AddAvailability, addAvailability, AvailabilitySlot, AvailabilityWithSlots, fetchAvailabilitySlots } from '../../services/workerService';
import moment from 'moment';


const formatDate = (dateString: string): string => {
  return moment(dateString).format('YYYY-MM-DD dddd'); // Formats as 'YYYY-MM-DD Day'
};


const AvailabilityManagement = () => {
    const [slots, setSlots] = useState<AvailabilityWithSlots[]>([]); // Updated to use AvailabilityWithSlots[]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [editingSlot, setEditingSlot] = useState<{ slotId: string; startTime: string; endTime: string } | null>(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleAddSlot = async () => {
      if (selectedDay && startTime && endTime) {
          const slotId = `${selectedDay}-${startTime}-${endTime}`;
          const date = new Date().toISOString(); // Ensure proper format
  
          const newSlot: AvailabilitySlot = {
              slotId,
              startTime,
              endTime,
              isAvailable: true,
          };
  
          const payload: AddAvailability = {
              date,
              slots: [newSlot], // Wrap the new slot in an array
          };
  
          setLoading(true);
          setError(null);
  
          try {
              // Call the backend to save the slot
              const createdAvailability: AddAvailability = await addAvailability(payload);
  
              // Ensure you create an AvailabilityWithSlots object from the response
              const createdSlot: AvailabilityWithSlots = {
                date: createdAvailability.date,
                slots: createdAvailability.slots.map((slot: any) => ({
                  slotId: slot.slotId,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isAvailable: true, // Set this based on your logic, e.g., response data
                })),
              
              };
  
              if (createdSlot) {
                  // Update the frontend slots list
                  setSlots((prevSlots) => [...prevSlots, createdSlot]);
  
                  // Clear input fields
                  setSelectedDay('');
                  setStartTime('');
                  setEndTime('');
              }
          } catch (err: any) {
              // Handle errors
              setError(err.response?.data?.error || 'Failed to add slot');
          } finally {
              setLoading(false);
          }
      }
  };
    const fetchSlots = async () => {
        setLoading(true);
        try {
            const workerId = localStorage.getItem('workerId'); // Retrieve worker ID from localStorage
            console.log("workerId from frontend", workerId);
            if (!workerId) {
                setError('Worker ID not found in localStorage.');
                return;
            }

            const fetchedSlots = await fetchAvailabilitySlots(workerId); // Fetching slots for the worker
            setSlots(fetchedSlots || []); // Update slots state with fetched slots
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch slots');
        } finally {
            setLoading(false);
        }
    };

    // Use useEffect to fetch slots when the component mounts
    useEffect(() => {
        fetchSlots(); // Fetch the initial slots when component mounts
    }, []);

    const handleDeleteSlot = () => {

    }

    const handleEditSlot = () => {
      
    }

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Manage Availability Slots</h1>
                <p className="text-gray-600 text-sm">
                    Define your availability to ensure users can book during your preferred time slots.
                </p>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a day</option>
                        {days.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>

                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={handleAddSlot}
                        disabled={!selectedDay || !startTime || !endTime}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ADD SLOT
                    </button>
                </div>

                {/* Display added slots */}
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Your Slots</h2>
                    {slots.length > 0 ? (
                        <ul className="space-y-2">
                            {slots.map((slot, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between items-center px-4 py-2 border rounded-md"
                                >
                                    <span>
                                    {formatDate(slot.date)}: {slot.slots.map(s => `${s.startTime} - ${s.endTime}`).join(', ')}
                                    </span>
                                    <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSlot()}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSlot()}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No slots added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManagement;
