import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './infrastructure/routes/userRoutes'
import workerRoutes from './infrastructure/routes/workerRoutes'
import adminRoutes from './infrastructure/routes/adminRoutes'
import cors from 'cors'
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import './sheduler'
import { setupSocket } from './infrastructure/sockets/chatSocket';
import http from 'http';


dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT as string;

//cors middleware to connect frontend
app.use(cors({
  origin: process.env.CLIENT_URL , 
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(morgan('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const io = setupSocket(server );

app.use('/api/auth', userRoutes);

app.use('/api/workers',workerRoutes)

app.use('/api/admin',adminRoutes)

// ✅ Add Default Route for Health Check
app.get('/', (req, res) => {
  res.send('Backend is running successfully ✅');
});


// Database connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Database connection error:', err));
