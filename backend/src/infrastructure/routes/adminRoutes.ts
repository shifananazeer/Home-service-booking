import express from 'express'
import { adminController } from '../../interface/controllers/adminController'
import { userController } from '../../interface/controllers/userController'
const router = express.Router()

router.post ('/login',adminController.adminLogin)
router.get('/get-users', adminController.getUser)
router.patch('/users/:userId/block', userController.blockUser);

router.patch('/users/:userId/unblock', userController.unblockUser);

export default router;