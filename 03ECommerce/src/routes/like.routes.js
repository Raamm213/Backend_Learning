import { Router } from 'express';
import {
  checkIfLiked,
  createLike,
  getLikesByComment,
  getLikesByTweet,
  getLikesByUser,
  getLikesByVideo,
  removeLike,
} from '../controllers/like.controller.js';
import authMiddle from '../middlewares/auth.middleware.js';

const routerLike = Router();

// Create a new like
routerLike.post('/', authMiddle, createLike);

// Remove a like by ID
routerLike.delete('/:id', authMiddle, removeLike);

// Get likes by user ID
routerLike.get('/user/:id', getLikesByUser);

// Get likes by comment ID
routerLike.get('/comment/:id', getLikesByComment);

// Get likes by tweet ID
routerLike.get('/tweet/:id', getLikesByTweet);

// Get likes by video ID
routerLike.get('/video/:id', getLikesByVideo);

// Check if user has liked specific content (requires content ID and type query)
routerLike.get('/check/:id', authMiddle, checkIfLiked);

export default routerLike;
