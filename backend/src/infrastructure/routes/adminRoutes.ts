import express from 'express'
import { adminController } from '../../interface/controllers/adminController'
import { userController } from '../../interface/controllers/userController'
import { workerController } from '../../interface/controllers/workerController'
import multer from 'multer'

import { authorizeRole } from '../../middleware/autherizeRole'
import { authenticateAdmin, authenticateUser } from '../../middleware/auth'
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()

router.post ('/login',adminController.adminLogin)
router.post("/refresh-token", adminController.refreshAccessToken);
router.get('/get-users',authenticateAdmin, authorizeRole(['admin']), adminController.getUser)
router.patch('/users/:userId/block',authenticateAdmin, authorizeRole(['admin']), userController.blockUser);
router.patch('/users/:userId/unblock',authenticateAdmin, authorizeRole(['admin']), userController.unblockUser);
router.get('/get-workers',authenticateAdmin, authorizeRole(['admin']), adminController.getWorker)
router.patch('/workers/:workerId/block',authenticateAdmin, authorizeRole(['admin']), workerController.blockWorker);
router.patch('/workers/:workerId/unblock',authenticateAdmin, authorizeRole(['admin']),workerController.unblockWorker)
router.post('/services',authenticateAdmin,authorizeRole(['admin']),upload.single('image'),adminController.createService)
router.get('/services',authenticateAdmin, authorizeRole(['admin']),adminController.getAllServices)
router.put('/service/edit/:serviceId',authenticateAdmin,authorizeRole(['admin']),upload.single('image'),adminController.updateService)
router.delete('/service/delete/:serviceId',authenticateAdmin, authorizeRole(['admin']), adminController.deleteService)
router.get('/bookings' ,authenticateAdmin, authorizeRole(['admin']), adminController.getAllBookings)
router.get('/revenue',authenticateAdmin, authorizeRole(['admin']), adminController.getRevenue)
router.get('/bookingCount' ,authenticateAdmin, authorizeRole(['admin']), adminController.getBookingCount)
router.get('/popularService' ,authenticateAdmin, authorizeRole(['admin']), adminController.getPopularService)
router.get('/topWorkers' ,authenticateAdmin, authorizeRole(['admin']), adminController.topWorkers)
router.get('/wallet' ,authenticateAdmin, authorizeRole(['admin']), adminController.getWallet)
router.get('/workerProfile/:workerId' ,authenticateAdmin, authorizeRole(['admin']), adminController.workerProfile)
export default router;