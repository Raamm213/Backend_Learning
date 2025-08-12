import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentByVideo,
  updateComment,
} from '../controllers/comment.controller.js';
import authMiddle from '../middlewares/auth.middleware.js';

const routerComment = Router();

routerComment.post('/', authMiddle, createComment);
routerComment.get('/:id', getCommentById);
routerComment.get('/video/:videoId', getCommentByVideo);
routerComment.patch('/:id', authMiddle, updateComment);
routerComment.delete('/:id', authMiddle, deleteComment);

export default routerComment;
