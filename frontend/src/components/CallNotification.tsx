// import React from 'react';
// import { Phone, PhoneOff } from 'lucide-react';
// import { useNotification } from './context/NotificationContext';

// const CallNotification: React.FC = () => {
//   const { callState, acceptCall, declineCall } = useNotification();

//   if (!callState.isIncoming) return null;

//   return (
//     <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
//       <div className="flex items-center mb-2">
//         <Phone className="text-green-500 mr-2" />
//         <h3 className="text-lg font-semibold">Incoming Call</h3>
//       </div>
//       <p className="mb-4">
//         <span className="font-medium">{callState.caller}</span> is calling you
//       </p>
//       <div className="flex justify-end space-x-2">
//         <button
//           onClick={declineCall}
//           className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center"
//         >
//           <PhoneOff size={20} className="mr-2" />
//           Decline
//         </button>
//         <button
//           onClick={acceptCall}
//           className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
//         >
//           <Phone size={20} className="mr-2" />
//           Accept
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CallNotification;

