import express from 'express'
import { adminController } from '../../interface/controllers/adminController'
import { userController } from '../../interface/controllers/userController'
import { workerController } from '../../interface/controllers/workerController'
import multer from 'multer'
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });
const router = express.Router()

router.post ('/login',adminController.adminLogin)
router.get('/get-users', adminController.getUser)
router.patch('/users/:userId/block', userController.blockUser);
router.patch('/users/:userId/unblock', userController.unblockUser);
router.get('/get-workers', adminController.getWorker)
router.patch('/workers/:workerId/block', workerController.blockWorker);
router.patch('/workers/:workerId/unblock',workerController.unblockWorker)
router.post('/services',upload.single('image'),adminController.createService)
export default router;