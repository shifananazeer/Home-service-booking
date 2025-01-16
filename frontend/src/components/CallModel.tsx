import React from "react";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  recipientName: string;
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  onAudioCall,
  onVideoCall,
  recipientName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-w-full p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Call {recipientName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            ✕
          </button>
        </div>
        <div className="grid gap-4">
          <button
            onClick={onAudioCall}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            <span className="mr-2">📞</span> Audio Call
          </button>
          <button
            onClick={onVideoCall}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            <span className="mr-2">🎥</span> Video Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
