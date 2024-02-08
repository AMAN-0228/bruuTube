import {Router} from 'express'
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetail, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js'
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
router.route('update-account-details').patch(verifyJwt,updateAccountDetail)
router.route('/update-password').post(verifyJwt,changeCurrentPassword)
router.route('/update-cover-image').patch(verifyJwt,upload.single('coverImage'),updateUserCoverImage)  
router.route('/update-avatar-image').patch(verifyJwt,upload.single('avatar'),updateUserAvatar)  
router.route('/current-user').get(verifyJwt,getCurrentUser)
router.route('/channel-profile/:userName').get(verifyJwt,getUserChannelProfile)
router.route('/watchHistory').get(verifyJwt,getWatchHistory)


export default router