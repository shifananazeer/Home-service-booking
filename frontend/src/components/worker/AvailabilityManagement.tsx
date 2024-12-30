import React, { useEffect, useState } from 'react';
import { AddAvailability, addAvailability, AvailabilitySlot, AvailabilityWithSlots, deleteAvailability, fetchAvailabilitySlots } from '../../services/workerService';
import moment from 'moment';
import Modal from './editModel';
import { Slot } from './editModel';
import { refreshAccessToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString: string): string => {
  return moment(dateString).format('YYYY-MM-DD dddd'); 
};

const AvailabilityManagement = () => {
  const [slots, setSlots] = useState<AvailabilityWithSlots[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const navigate = useNavigate()
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

useEffect(()=> {
const refresh = async () => {
  const refreshToken = localStorage.getItem('worker_refresh_token')
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
}
refresh();
}, [])

  const calculateDate = (selectedDay: string): string => {
    const today = moment();
    const dayIndex = days.indexOf(selectedDay); 
    const todayIndex = today.isoWeekday() - 1; 
  
    
    const daysUntilSelectedDay = (dayIndex - todayIndex + 7) % 7 || 7;
    return today.add(daysUntilSelectedDay, 'days').startOf('day').toISOString();
  };

  const handleAddSlot = async () => {
    if (selectedDay && startTime && endTime) {
      const slotId = `${selectedDay}-${startTime}-${endTime}`;
      const date = calculateDate(selectedDay);
   console.log("date",date)
      const newSlot: AvailabilitySlot = {
        slotId,
        startTime,
        endTime,
        isAvailable: true,
      };
      const payload: AddAvailability = {
        date,
        slots: [newSlot],
      };

      setLoading(true);
      setError(null);

      try {
        const createdAvailability: AddAvailability = await addAvailability(payload);

        const createdSlot: AvailabilityWithSlots = {
          date: createdAvailability.date,
          slots: createdAvailability.slots.map((slot) => ({
            slotId: slot.slotId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
          })),
        };

        if (createdSlot) {
          setSlots((prevSlots) => [...prevSlots, createdSlot]);
          setSelectedDay('');
          setStartTime('');
          setEndTime('');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to add slot');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchSlots = async (page = 1) => {
    setLoading(true);
    try {
        const workerId = localStorage.getItem('workerId');
        if (!workerId) {
            setError('Worker ID not found in localStorage.');
            return;
        }
        const { data, pagination }  = await fetchAvailabilitySlots(workerId, page, 5); 
        if (data && pagination) {
          const now = moment();
          const validSlots = data.filter((availability: AvailabilityWithSlots) =>
            moment(availability.date).isSameOrAfter(now, 'day')
          );
          setSlots(validSlots);
          setTotalPages(pagination.totalPages);
          setCurrentPage(pagination.currentPage);
      } else {
          setError('Unexpected response structure');
      }
    } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch slots');
    } finally {
        setLoading(false);
    }
};
  useEffect(() => {
    fetchSlots();
  }, []);

  const handleDeleteSlot = async(slotId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this slot?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    
    try {
        const workerId = localStorage.getItem('workerId');
        if (!workerId) {
            setError('Worker ID not found in localStorage.');
            return;
        }
        await deleteAvailability( slotId); 
        setSlots((prevSlots) =>
            prevSlots.map((availability) => ({
                ...availability,
                slots: availability.slots.filter((slot) => slot.slotId !== slotId),
            })).filter((availability) => availability.slots.length > 0) 
        );
    } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete slot');
    } finally {
        setLoading(false);
    }
};

  const handlePageChange = (page: number) => {
    fetchSlots(page);
};

  const handleEditSlot = (slotId: string) => {
    const slotToEdit = slots
      .flatMap(availability => availability.slots)
      .find(slot => slot.slotId === slotId);

    if (slotToEdit) {
      setEditingSlot({
        ...slotToEdit,
        isAvailable: slotToEdit.isAvailable, 
      });
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSlot(null); 
  };

  const handleModalSubmit = (updatedSlot: Slot) => {

    setSlots((prevSlots) =>
      prevSlots.map((availability) => ({
        ...availability,
        slots: availability.slots.map((slot) =>
          slot.slotId === updatedSlot.slotId ? updatedSlot : slot
        ),
      }))
    );

    console.log('Updated Slot:', updatedSlot);
    handleModalClose();
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

      
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Your Slots</h2>
          {slots.length > 0 ? (
            <ul className="space-y-2">
              {slots.map((availability) =>
                availability.slots.map((slot) => (
                  <li
                    key={slot.slotId}
                    className="flex justify-between items-center px-4 py-2 border rounded-md"
                  >
                    <span>
                      {formatDate(availability.date)}: {slot.startTime} - {slot.endTime}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSlot(slot.slotId)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.slotId)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p>No slots added yet.</p>
          )}
        </div>
      </div>

      {/* Modal for editing slot */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingSlot} 
      />
      <div className="flex justify-between items-center mt-6">
    <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Previous
    </button>
    <span className="text-gray-700">
        Page {currentPage} of {totalPages}
    </span>
    <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Next
    </button>
</div>
    </div>
  );
};

export default AvailabilityManagement;
