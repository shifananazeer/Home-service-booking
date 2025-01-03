import express from 'express'
import { adminController } from '../../interface/controllers/adminController'
import { userController } from '../../interface/controllers/userController'
import { workerController } from '../../interface/controllers/workerController'
import multer from 'multer'
import { authenticateAdmin } from '../../middleware/adminAuthentication'
import { authorizeRole } from '../../middleware/autherizeRole'
import { authenticateUser } from '../../middleware/auth'
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()

router.post ('/login',adminController.adminLogin)
router.post("/refresh-token", adminController.refreshAccessToken);
router.get('/get-users',authenticateUser, authorizeRole(['admin']), adminController.getUser)
router.patch('/users/:userId/block',authenticateUser, authorizeRole(['admin']), userController.blockUser);
router.patch('/users/:userId/unblock',authenticateUser, authorizeRole(['admin']), userController.unblockUser);
router.get('/get-workers',authenticateUser, authorizeRole(['admin']), adminController.getWorker)
router.patch('/workers/:workerId/block',authenticateUser, authorizeRole(['admin']), workerController.blockWorker);
router.patch('/workers/:workerId/unblock',authenticateUser, authorizeRole(['admin']),workerController.unblockWorker)
router.post('/services',upload.single('image'),adminController.createService)
router.get('/services',authenticateUser, authorizeRole(['admin']),adminController.getAllServices)
router.put('/service/edit/:serviceId',upload.single('image'),adminController.updateService)
router.delete('/service/delete/:serviceId',authenticateUser, authorizeRole(['admin']), adminController.deleteService)
router.get('/bookings' ,authenticateUser, authorizeRole(['admin']), adminController.getAllBookings)
export default router;