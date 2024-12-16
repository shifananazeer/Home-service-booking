import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './infrastructure/routes/userRoutes'
import workerRoutes from './infrastructure/routes/workerRoutes'
import adminRoutes from './infrastructure/routes/adminRoutes'
import cors from 'cors'
dotenv.config();

const app = express();
app.use(express.json());

//cors middleware to connect fronte
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], 
  credentials: true, 
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
