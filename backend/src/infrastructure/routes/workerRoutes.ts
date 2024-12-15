import express from 'express'
import { workerController } from '../../interface/controllers/workerController';

const router = express.Router()

router.post('/signup', workerController.signupWorker);
router.post('/verify-otp', workerController.validateOtp)
router.post('/resend-otp',workerController.resendOtp)
router.post('/login',workerController.login)
router.post('/forgot-password', workerController.forgotPassword);
router.get('/reset-password/:token', workerController.validateResetToken);
router.post('/reset-password', workerController.resetPassword);
router.post('/reset-password', workerController.resetPassword);


export default router;