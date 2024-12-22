import React, { useState, useEffect } from 'react';
import { updateSlotData } from '../../services/workerService'; // Adjust the import path as necessary

export interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean; // Ensure this property is present
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedSlot: Slot) => void;
  initialData: Slot | null; // This now correctly expects Slot or null
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Use useEffect to update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    }
  }, [initialData]); // This effect runs whenever initialData changes

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (initialData) {
      const updatedSlot: Slot = {
        ...initialData,
        startTime,
        endTime,
      };

      const slotId = initialData.slotId; // Get the slotId from initialData

      try {
        const response = await updateSlotData(updatedSlot, slotId); // Call your service function
        console.log('Slot updated successfully:', response.data); // Log or handle the response as needed

        // Optionally, call onSubmit with the updated slot data to refresh the UI in the parent component
        onSubmit(updatedSlot);
      } catch (error) {
        console.error('Error updating slot:', error);
      }
    }
    onClose(); // Close the modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h2 className="text-lg font-bold mb-4">Edit Availability Slot</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 text-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
