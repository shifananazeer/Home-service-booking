import React, { useEffect, useState } from 'react';
import { AddAvailability, addAvailability, AvailabilitySlot, AvailabilityWithSlots, deleteAvailability, fetchAvailabilitySlots } from '../../services/workerService';
import moment from 'moment';
import Modal from './editModel';
import { Slot } from './editModel';
import { refreshAccessToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/store';
import { useSelector } from 'react-redux';

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
  const refreshToken = useSelector((state: RootState) => state.worker.refreshToken);
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
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white shadow-lg rounded-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Availability Slots</h1>
        <p className="text-gray-400 text-sm">
          Define your availability to ensure users can book during your preferred time slots.
        </p>
      </div>

      {loading && <p className="text-blue-400 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-6 bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Slot</h2>
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />

          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />

          <button
            onClick={handleAddSlot}
            disabled={!selectedDay || !startTime || !endTime}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out"
          >
            ADD SLOT
          </button>
        </div>
      </div>

      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Your Slots</h2>
        {slots.length > 0 ? (
          <ul className="space-y-4">
            {slots.map((availability) =>
              availability.slots.map((slot) => (
                <li
                  key={slot.slotId}
                  className="flex justify-between items-center px-6 py-4 bg-gray-700 rounded-md transition duration-300 ease-in-out hover:bg-gray-600"
                >
                  <span className="text-lg">
                    {formatDate(availability.date)}: {slot.startTime} - {slot.endTime}
                  </span>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEditSlot(slot.slotId)}
                      className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.slotId)}
                      className="text-red-400 hover:text-red-300 transition duration-300 ease-in-out"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        ) : (
          <p className="text-gray-400">No slots added yet.</p>
        )}
      </div>

      {/* Modal for editing slot */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingSlot} 
      />
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition duration-300 ease-in-out"
        >
          Previous
        </button>
        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition duration-300 ease-in-out"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AvailabilityManagement;

