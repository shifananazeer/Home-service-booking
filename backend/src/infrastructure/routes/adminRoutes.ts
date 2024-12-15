import express from 'express'
import { adminController } from '../../interface/controllers/adminController'
const router = express.Router()

router.post ('/login',adminController.adminLogin)
router.get('/get-users', adminController.getUser)

export default router;