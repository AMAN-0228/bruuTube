import {Router} from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

// secured routes
router.route('/logout').get(verifyJwt,logoutUser)
router.route('/refresh-token').get(refreshAccessToken)

export default router