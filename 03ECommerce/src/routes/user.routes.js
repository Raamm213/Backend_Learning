import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const routerUser = Router();

routerUser.post(
  '/',
  upload.fields([
    {
      name: 'avatar',
      count: 1,
    },
    {
      name: 'coverImage',
      count: 1,
    },
  ]),
  registerUser
);

export default routerUser;
