import { Router } from 'express';
import authMiddle from '../middlewares/auth.middleware.js';
import {
  createTweet,
  deleteTweet,
  getByChannel,
  getById,
  updateTweet,
} from '../controllers/tweet.controllers.js';

const routerTweet = Router();
//secured routing
routerTweet.post('/', authMiddle, createTweet);
routerTweet.patch('/tweet/:id', authMiddle, updateTweet);
routerTweet.delete('/delete/:id', authMiddle, deleteTweet);
//unsecured routing
routerTweet.get('/tweet/:id', getById);
routerTweet.get('/channel/:channel', getByChannel);

export default routerTweet;
