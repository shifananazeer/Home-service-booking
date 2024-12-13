import express from 'express'
import { workerController } from '../../interface/controllers/workerController';

const router = express.Router()

router.post('/signup', workerController.signupWorker);
router.post('/verify-otp', workerController.validateOtp)


export default router;