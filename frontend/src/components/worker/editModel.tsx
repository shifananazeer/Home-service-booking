import React, { useState, useEffect } from 'react';
import { updateSlotData } from '../../services/workerService'; 

export interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean; 
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedSlot: Slot) => void;
  initialData: Slot | null; 
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (initialData) {
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    }
  }, [initialData]); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (initialData) {
      const updatedSlot: Slot = {
        ...initialData,
        startTime,
        endTime,
      };

      const slotId = initialData.slotId; 

      try {
        const response = await updateSlotData(updatedSlot, slotId); 
        console.log('Slot updated successfully:', response.data); 
        onSubmit(updatedSlot);
      } catch (error) {
        console.error('Error updating slot:', error);
      }
    }
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">Edit Availability Slot</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300 ease-in-out"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;

