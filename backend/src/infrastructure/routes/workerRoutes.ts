import express from 'express'
import { workerController } from '../../interface/controllers/workerController';
import  { authenticateUser } from '../../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()

router.post('/signup', workerController.signupWorker);
router.post('/verify-otp', workerController.validateOtp)
router.post('/resend-otp',workerController.resendOtp)
router.post('/login',workerController.login)
router.post('/forgot-password', workerController.forgotPassword);
router.get('/reset-password/:token', workerController.validateResetToken);
router.post('/reset-password', workerController.resetPassword);
router.get('/profile',authenticateUser, workerController.getWorkerProfile); // Get worker profile by ID
router.put('/profile/edit', authenticateUser ,upload.single('profilePic'), workerController.updateWorkerProfile);
router.post('/availability',authenticateUser,workerController.handleCreateAvailability)
router.get('/availability/:workerId', authenticateUser, workerController.fetchAvailabilitySlotForWorker);
router.put('/availability/edit/:slotId', authenticateUser, workerController.editAvailabilitySlot);
router.delete('/availability/delete/:slotId', authenticateUser,workerController.deleteAvailabilitySlot);
export default router;