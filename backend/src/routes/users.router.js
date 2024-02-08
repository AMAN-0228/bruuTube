import {Router} from 'express'
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetail, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

router.route('/register').post( upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),registerUser)
router.route('/login').post(loginUser)

// secured routes
router.route('/logout').get(verifyJwt,logoutUser)
router.route('/refresh-token').get(refreshAccessToken)
router.route('update-account-details').post(verifyJwt,updateAccountDetail)
router.route('/update-password').post(verifyJwt,changeCurrentPassword)
router.route('/update-cover-image').post(upload.single('coverImage'),verifyJwt,updateUserCoverImage)  
router.route('/update-avatar-image').post(upload.single('avatar'),verifyJwt,updateUserAvatar)  
router.route('/fetch-current-user-data').get(verifyJwt,getCurrentUser)


export default router