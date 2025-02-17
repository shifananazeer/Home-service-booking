import express from 'express'
import { workerController } from '../../interface/controllers/workerController';
import  { authenticateUser, authenticateWorker } from '../../middleware/auth';
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
router.get('/profile',authenticateWorker,authorizeRole(['worker']), workerController.getWorkerProfile); 
router.put('/profile/edit', authenticateWorker ,authorizeRole(['worker']),upload.single('profilePic'), workerController.updateWorkerProfile);
router.post('/availability',authenticateWorker,authorizeRole(['worker']),workerController.handleCreateAvailability)
router.get('/availability/:workerId',authenticateWorker,authorizeRole(['worker']), workerController.fetchAvailabilitySlotForWorker);
router.put('/availability/edit/:slotId',authenticateWorker,authorizeRole(['worker']), workerController.editAvailabilitySlot);
router.delete('/availability/delete/:slotId',authenticateWorker,authorizeRole(['worker']), workerController.deleteAvailabilitySlot);
router.put('/updateLocation',authenticateWorker,authorizeRole(['worker']),workerController.updateLocation)
router.get('/bookings/:workerId',authenticateWorker,authorizeRole(['worker']), workerController.allBookingsByworkerId);
router.get('/:workerId',authenticateWorker ,authorizeRole(['worker']), workerController.getWorkerLocation)
router.get('/today-booking/:workerId',authenticateWorker,authorizeRole(['worker']),workerController.todaysBooking)
router.post('/chat', workerController.handleCreateOrfetchChat)
router.post('/message',upload.single('media'), workerController.handleSendMessage);
router.get('/messages/:chatId' ,authenticateWorker,authorizeRole(['worker']), workerController.handleGetMessage)
router.get('/chat/:workerId' ,authenticateWorker,authorizeRole(['worker']), workerController.getMessages)
router.post('/reaction/:messageId',authenticateWorker,authorizeRole(['worker']), workerController.addReaction)
router.get("/unread-messages/:workerId" ,authenticateWorker,authorizeRole(['worker']), workerController.getUnreadNotification)
router.post('/bookings/mark-as-completed' ,authenticateWorker ,authorizeRole(['worker']), workerController.updateWorkStatus)
router.get ('/revenue/:workerId'  ,authenticateWorker ,authorizeRole(['worker']), workerController.getRevenue)
router.get('/bookingsCount/:workerId' ,authenticateWorker ,authorizeRole(['worker']), workerController.getBookingCount)
router.get('/ratings/:workerId',authenticateWorker ,authorizeRole(['worker']), workerController.getRatingsAndReview)
router.get('/wallet/:workerId' ,authenticateWorker ,authorizeRole(['worker']), workerController.getWallet)
router.get('/skills/:workerId' ,authenticateWorker ,authorizeRole(['worker']), workerController.skillBasedBooking)
export default router;