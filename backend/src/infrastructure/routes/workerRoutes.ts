import express from 'express'
import { workerController } from '../../interface/controllers/workerController';

const router = express.Router()

router.post('/signup', workerController.signupWorker);
router.post('/verify-otp', workerController.validateOtp)
router.post('/login',workerController.login)


export default router;