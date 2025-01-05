import express from 'express'
import { workerController } from '../../interface/controllers/workerController';
import  { authenticateUser } from '../../middleware/auth';
import multer from 'multer';
import { authorizeRole } from '../../middleware/autherizeRole';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()

router.post('/signup', workerController.signupWorker);
router.post('/verify-otp', workerController.validateOtp)
router.post('/resend-otp',workerController.resendOtp)
router.post('/login',workerController.login)
router.post('/forgot-password', workerController.forgotPassword);
router.get('/reset-password/:token', workerController.validateResetToken);
router.post('/reset-password', workerController.resetPassword);
router.post("/refresh-token", workerController.refreshAccessToken);
router.get('/services', workerController.getServices)
router.get('/profile',authenticateUser,authorizeRole(['worker']), workerController.getWorkerProfile); 
router.put('/profile/edit', authenticateUser ,authorizeRole(['worker']),upload.single('profilePic'), workerController.updateWorkerProfile);
router.post('/availability',authenticateUser,authorizeRole(['worker']),workerController.handleCreateAvailability)
router.get('/availability/:workerId',authenticateUser,authorizeRole(['worker']), workerController.fetchAvailabilitySlotForWorker);
router.put('/availability/edit/:slotId',authenticateUser,authorizeRole(['worker']), workerController.editAvailabilitySlot);
router.delete('/availability/delete/:slotId',authenticateUser,authorizeRole(['worker']), workerController.deleteAvailabilitySlot);
router.put('/updateLocation',authenticateUser,authorizeRole(['worker']),workerController.updateLocation)
router.get('/bookings/:workerId',authenticateUser,authorizeRole(['worker']), workerController.allBookingsByworkerId);
router.get('/:workerId',authenticateUser ,authorizeRole(['worker']), workerController.getWorkerLocation)
router.get('/today-booking/:workerId',authenticateUser,authorizeRole(['worker']),workerController.todaysBooking)
export default router;