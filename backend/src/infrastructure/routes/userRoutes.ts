import express from 'express'
import { userController } from '../../interface/controllers/userController'
import { authenticateUser } from '../../middleware/auth'
const router = express.Router()


router.post("/register",userController.register)
router.post("/login",userController.login)
router.post("/verify-otp",userController.validateOtp)
router.post("/resend-otp",userController.resendOtp)
router.post('/forgot-password',userController.forgotPassword)
router.get('/reset-password/:token', userController.validateResetToken);
router.post('/reset-password', userController.resetPassword);
router.post("/refresh-token", userController.refreshAccessToken);
router.get("/profile", authenticateUser, userController.getUserProfile); 


export default router;