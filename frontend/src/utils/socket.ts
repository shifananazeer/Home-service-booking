// socket.ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true, // Ensure credentials are included for CORS
});

export default socket;
