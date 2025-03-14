import {Router} from 'express';
import userService from '../service/userService.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router();

router.route('/register').post( upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),userService.registerUser);

router.route('/login').post(userService.loginUser);

// secured routes
router.route('/logout').get( async (req, res, next) =>{
  console.log('_________ 1');
  
  try {
    await verifyJwt(req, res, next);
  } catch (error) {
    console.log('_________ 2');
    
  }

  userService.logoutUser();
  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, "logout successful"));
});
// router.route('/refresh-token').get(userService.refreshAccessToken);
router.route('update-account-details').patch(verifyJwt,userService.updateAccountDetail);
router.route('/update-password').post(verifyJwt,userService.changeCurrentPassword);
router.route('/update-cover-image').patch(verifyJwt,upload.single('coverImage'),userService.updateUserCoverImage);
router.route('/update-avatar-image').patch(verifyJwt,upload.single('avatar'),userService.updateUserAvatar);
// router.route('/current-user').get(verifyJwt,userService.getCurrentUser);
router.route('/channel-profile/:userName').get(verifyJwt,userService.getUserChannelProfile);
router.route('/watchHistory').get(verifyJwt,userService.getWatchHistory);


export default router;