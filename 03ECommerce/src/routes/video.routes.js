import { Router } from 'express';
import authMiddle from '../middlewares/auth.middleware.js';
import {
  createVideo,
  deleteVideo,
  getVideoById,
  getVideosByChannel,
  incrementViews,
  togglePublish,
  updateVideo,
} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const routerVideo = Router();

//secured routings
routerVideo.post(
  '/',
  upload.fields([
    {
      name: 'videoFile',
      maxCount: 1,
    },
    {
      name: 'thumbnail',
      maxCount: 1,
    },
  ]),
  authMiddle,
  createVideo
);
routerVideo.patch('/update/:id', authMiddle, updateVideo);
routerVideo.delete('/delete/:id', authMiddle, deleteVideo);
routerVideo.patch('/publish/:id', authMiddle, togglePublish);
routerVideo.patch('/watch/:id', authMiddle, incrementViews);
//unsecured routings
routerVideo.get('/video/:id', getVideoById);
routerVideo.get('/channel/:channel', getVideosByChannel);

export default routerVideo;
