import express from 'express'
import { adminController } from '../../interface/controllers/adminController'
import { userController } from '../../interface/controllers/userController'
import { workerController } from '../../interface/controllers/workerController'
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()

router.post ('/login',adminController.adminLogin)
router.get('/get-users', adminController.getUser)
router.patch('/users/:userId/block', userController.blockUser);
router.patch('/users/:userId/unblock', userController.unblockUser);
router.get('/get-workers', adminController.getWorker)
router.patch('/workers/:workerId/block', workerController.blockWorker);
router.patch('/workers/:workerId/unblock',workerController.unblockWorker)
router.post('/services',upload.single('image'),adminController.createService)
router.get('/services',adminController.getAllServices)
router.put('/service/edit/:serviceId',upload.single('image'),adminController.updateService)
router.delete('/service/delete/:serviceId', adminController.deleteService)
router.get('/bookings' , adminController.getAllBookings)
export default router;