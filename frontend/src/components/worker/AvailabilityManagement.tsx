import React, { useState } from 'react';
import { AddAvailability, addAvailability } from '../../services/workerService';

export interface AvailabilityWithSlots {
  date: string; // or Date
  slots: {
      slotId: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
  }[];
}

const AvailabilityManagement = () => {
    const [slots, setSlots] = useState<{ day: string; startTime: string; endTime: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const handleAddSlot = async () => {
      if (selectedDay && startTime && endTime) {
          // Generate `slot` and `date` based on input
          const slotId = `${selectedDay}-${startTime}-${endTime}`;
        const date = new Date().toISOString(); // Ensure proper format
        const slots = [{ 
            slotId, 
            startTime, 
            endTime, 
            isAvailable: true 
        }]; // Example: You can modify this logic
  
          // const newSlot: AddAvailability = { 
          //     day: selectedDay, 
          //     startTime, 
          //     endTime, 
          //     slot, 
          //     date 
          // };
          const payload : AvailabilityWithSlots = { date, slots };
          setLoading(true);
          setError(null);
  
          try {
              // Call the backend to save the slot
              const createdSlot = await addAvailability(payload);
  
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
                                        {slot.day}: {slot.startTime} - {slot.endTime}
                                    </span>
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
