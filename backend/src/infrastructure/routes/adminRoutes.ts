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
router.get('/revenue', adminController.getRevenue)
router.get('/bookingCount' , adminController.getBookingCount)
router.get('/popularService' , adminController.getPopularService)
router.get('/topWorkers' , adminController.topWorkers)
export default router;