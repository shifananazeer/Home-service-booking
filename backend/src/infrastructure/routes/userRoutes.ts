import express from 'express'
import { userController } from '../../interface/controllers/userController'
import { authenticateUser } from '../../middleware/auth'
import multer from 'multer'
const router = express.Router()

const upload = multer({storage: multer.memoryStorage()});
router.post("/register",userController.register)
router.post("/login",userController.login)
router.post("/verify-otp",userController.validateOtp)
router.post("/resend-otp",userController.resendOtp)
router.post('/forgot-password',userController.forgotPassword)
router.get('/reset-password/:token', userController.validateResetToken);
router.post('/reset-password', userController.resetPassword);
router.post("/refresh-token", userController.refreshAccessToken);
router.get("/profile", authenticateUser, userController.getUserProfile); 
router.put('/profile/edit', authenticateUser ,upload.single('profilePic'),userController.editProfile)

export default router;