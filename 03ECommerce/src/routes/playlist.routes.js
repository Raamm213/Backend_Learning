import { Router } from 'express';
import authMiddle from '../middlewares/auth.middleware.js';
import {
  addVideo,
  createPlaylist,
  deletePlaylist,
  getById,
  getByUser,
  removeVideo,
  updatePlaylist,
} from '../controllers/playlist.controller.js';

const routerPlaylist = Router();

routerPlaylist.get('/user/:id', getByUser); //done

routerPlaylist.post('/', authMiddle, createPlaylist); //done
routerPlaylist.patch('/update/:id', authMiddle, updatePlaylist);
routerPlaylist.delete('/delete/:id', authMiddle, deletePlaylist);
routerPlaylist.patch('/add/video/:id', authMiddle, addVideo);
routerPlaylist.patch('/remove/video/:id', authMiddle, removeVideo);

routerPlaylist.get('/:id', getById);//done

export default routerPlaylist;
