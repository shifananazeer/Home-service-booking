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



dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json()); // Increase this limit based on your needs
app.use(express.urlencoded());
app.use(cookieParser());

//cors middleware to connect frontend
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use('/api/auth', userRoutes);

app.use('/api/workers',workerRoutes)

app.use('/api/admin',adminRoutes)




// Database connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('Database connection error:', err));
