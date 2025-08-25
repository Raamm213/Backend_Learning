import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Comment } from '../models/comment.models.js';
import { validateObjectId } from '../utils/validation.js';

const createComment = asynchandler(async (req, res) => {
  const { content, video } = req.body;

  if (!content || !video) {
    throw new apiError(
      400,
      'content and the video didnt received the controller from the body'
    );
  }

  const owner = req.user?._id;
  const comment = await Comment.create({
    content,
    owner,   
    video,
  });

  if (!comment) {
    throw new apiError(500, 'something is wrong while creating the comment');
  }

  console.log(comment);

  return res
    .status(201)
    .json(
      new apiResponse(201, comment, 'you have successfully created the comment')
    );
});

const getCommentById = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'cant retrieve the id from the params');
  }

  // Validate if the id is a valid MongoDB ObjectId
  try {
    validateObjectId(id, 'comment ID');
  } catch (error) {
    throw new apiError(400, error.message);
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new apiError(404, 'given params id is not there in the database');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        comment,
        'successfully retrieved the comment based on the id'
      )
    );
});

const getCommentByVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(400, 'video id is not available in the params');
  }

  const comments = await Comment.find({ video: videoId });

  if (!comments || comments.length == 0) {
    throw new apiError(
      404,
      'there is no such comment for the video id you gave'
    );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        comments,
        'successfully retrieved the comments based on the video id'
      )
    );
});

const updateComment = asynchandler(async (req, res) => {
  const { id } = req.params;
  const newComment = req.body;

  if (!id) {
    throw new apiError(400, "cant get the comment id from the params");
  }

  // Validate if the id is a valid MongoDB ObjectId
  try {
    validateObjectId(id, 'comment ID');
  } catch (error) {
    throw new apiError(400, error.message);
  }

  const oldComment = await Comment.findById(id);

  if (!oldComment) {
    throw new apiError(404, "sorry there is no such comment id exist");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    newComment,
    { new: true }
  );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedComment,
        "successfully updated the comment"
      )
    );
});

const deleteComment = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, "can't extract the comment from the params");
  }

  // Validate if the id is a valid MongoDB ObjectId
  try {
    validateObjectId(id, 'comment ID');
  } catch (error) {
    throw new apiError(400, error.message);
  }

  const deletedComment = await Comment.findByIdAndDelete(id);

  if (!deletedComment) {
    throw new apiError(404, "such comment is not exist to delete the comment");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        deletedComment,
        "successfully deleted the comment"
      )
    );
});

export {
  createComment,
  getCommentById,
  getCommentByVideo,
  updateComment,
  deleteComment,
};
