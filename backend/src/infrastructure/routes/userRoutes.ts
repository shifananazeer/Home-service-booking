import express from 'express'
import { userController } from '../../interface/controllers/userController'
const router = express.Router()


router.post("/register",userController.register)
router.post("/login",userController.login)
router.post("/verify-otp",userController.validateOtp)
router.post("/resend-otp",userController.resendOtp)
router.post('/forgot-password',userController.forgotPassword)
router.get('/reset-password/:token', userController.validateResetToken);
router.post('/reset-password', userController.resetPassword);


export default router;