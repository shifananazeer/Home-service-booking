import express from 'express'
import { userController } from '../../interface/controllers/userController'
import { authenticateUser } from '../../middleware/auth'
import multer from 'multer'
import { adminController } from '../../interface/controllers/adminController'
import { workerController } from '../../interface/controllers/workerController'
import { validateRequest } from '../../middleware/validateRequest'
import { registerSchema } from '../../validators/registerValidator'
export const router = express.Router()

export const upload = multer({storage: multer.memoryStorage()});
router.post("/register",validateRequest(registerSchema) ,userController.register)
router.post("/login",userController.login)
router.post("/verify-otp",userController.validateOtp)
router.post("/resend-otp",userController.resendOtp)
router.post('/forgot-password',userController.forgotPassword)
router.get('/reset-password/:token', userController.validateResetToken);
router.post('/reset-password', userController.resetPassword);
router.post("/refresh-token", userController.refreshAccessToken);
router.get('/services',authenticateUser, userController.getServices)
router.get("/profile", authenticateUser, userController.getUserProfile); 
router.put('/profile/edit', authenticateUser ,upload.single('profilePic'),userController.editProfile)
router.put('/updateLocation',authenticateUser,userController.updateLocation)
router.get('/address/:userId',authenticateUser , userController.getAddress)
router.get('/workers',authenticateUser,workerController.findWorkerBySkills)
router.get('/available-slots',authenticateUser,userController.availableSlots)
router.post('/create-booking',authenticateUser , userController.createBooking)
router.get('/booking/:userId' ,authenticateUser , userController.getBookings)
router.get('/worker/:workerId' ,authenticateUser , userController.fetchWorkerDetails)
router.post('/cancelBooking/:bookingId' , authenticateUser , userController.cancelBooking)
router.post('/user/reset-password/:userId',authenticateUser , userController.resetPasswordFromProfile)
router.post ('/create-checkout-session', authenticateUser,userController.createCheckoutSession)
router.post('/create-payment', authenticateUser,userController.createPayment)
router.get('/get-booking-details/:bookingId' , authenticateUser, userController.getBooking)
router.post('/update-paymentStatus/:bookingId' ,authenticateUser, userController.updatePaymentStatus)
router.get('/worker-profile/:workerId' , authenticateUser , userController.getWorkerProfile)
router.post("/chat", userController.handleCreateOrfetchChat);
router.post("/message",upload.single('media'),  userController.handleSendMessage);
router.get("/messages/:chatId", userController.handleGetMessage);
router.post('/reaction/:messageId' , authenticateUser ,userController.addReaction)
router.get('/chat/:userId' , userController.getMessages)
router.get("/unread-messages/:userId" ,authenticateUser , userController.getUnreadNotification)
router.get('/get-workers/:userId'  ,authenticateUser, userController.getWorkersByUserId)
router.get('/balanceAmount/:bookingId' ,authenticateUser , userController.getBalanceAmount)
router.get('/get-notifications/:userId' , authenticateUser , userController.getNotifications)
router.get('/bookings/:bookingId' , authenticateUser , userController.fetchBookingsDetails)

router.get('/slots' , userController. getSlotsByDate)
router.post('/ratings' , userController.addRatings)
router.get('/unreadNotifications/:userId' , userController.unreadNotification)
router.patch('/markTrue/:userId' , userController.markTrue)
export default router;