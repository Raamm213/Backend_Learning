import { Router } from 'express';
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  logInUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  logOutUser,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import authMiddle from '../middlewares/auth.middleware.js';

const routerUser = Router();

//unsecured routes (without the verifyJWT)
routerUser.post(
  '/register',
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);
routerUser.route('/login').post(logInUser);
routerUser.route('/refresh_token').post(refreshAccessToken);

//secured routes (with the verifyJWT )
routerUser.route('/logout').post(authMiddle, logOutUser);
routerUser.route('/change_password').post(authMiddle, changeCurrentPassword);
routerUser.route('/current_user').get(authMiddle, getCurrentUser);
routerUser.route('/channel/:username').get(authMiddle, getUserChannelProfile);
routerUser.route('/update_account').patch(authMiddle, updateAccountDetails);
routerUser
  .route('/update_avatar')
  .patch(authMiddle, upload.single('avatar'), updateAvatarImage);
routerUser
  .route('/update_cover')
  .patch(authMiddle, upload.single('coverimage'), updateCoverImage);
routerUser.route('/history').get(authMiddle, getWatchHistory);

export default routerUser;
