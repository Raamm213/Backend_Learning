import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Like } from '../models/liket.models.js';

const createLike = asynchandler(async (req, res) => {
  // Check if user is authenticated
  if (!req.user?._id) {
    throw new apiError(401, 'User not authenticated');
  }

  const { comment, video, tweet } = req.body;

  // At least one content type must be provided
  if (!comment && !video && !tweet) {
    throw new apiError(400, 'At least one content type (comment, video, or tweet) is required');
  }

  const likedBy = req.user._id;

  const like = await Like.create({
    comment: comment || null,
    video: video || null,
    tweet: tweet || null,
    likedBy,
  });

  return res
    .status(201)
    .json(new apiResponse(201, like, 'Like created successfully'));
});

const removeLike = asynchandler(async (req, res) => {
  // Check if user is authenticated
  if (!req.user?._id) {
    throw new apiError(401, 'User not authenticated');
  }

  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'Like ID is required');
  }

  const deleted = await Like.findByIdAndDelete(id);

  if (!deleted) {
    throw new apiError(404, 'Like not found');
  }

  return res
    .status(200)
    .json(new apiResponse(200, deleted, 'Like removed successfully'));
});

const getLikesByUser = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'User ID is required');
  }

  const likesByUser = await Like.find({
    likedBy: id,
  });

  if (!likesByUser || likesByUser.length === 0) {
    throw new apiError(404, 'No likes found for this user');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        likesByUser,
        'Successfully retrieved likes by user'
      )
    );
});

const getLikesByVideo = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'Video ID is required');
  }

  const likesByVideo = await Like.find({
    video: id,
  });

  if (!likesByVideo || likesByVideo.length === 0) {
    throw new apiError(404, 'No likes found for this video');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        likesByVideo,
        'Successfully retrieved likes for video'
      )
    );
});

const getLikesByComment = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'Comment ID is required');
  }

  const likesByComment = await Like.find({
    comment: id,
  });

  if (!likesByComment || likesByComment.length === 0) {
    throw new apiError(404, 'No likes found for this comment');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        likesByComment,
        'Successfully retrieved likes for comment'
      )
    );
});

const getLikesByTweet = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'Tweet ID is required');
  }

  const likesByTweet = await Like.find({
    tweet: id,
  });

  if (!likesByTweet || likesByTweet.length === 0) {
    throw new apiError(404, 'No likes found for this tweet');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        likesByTweet,
        'Successfully retrieved likes for tweet'
      )
    );
});

const checkIfLiked = asynchandler(async (req, res) => {
  // Check if user is authenticated
  if (!req.user?._id) {
    throw new apiError(401, 'User not authenticated');
  }

  const { id } = req.params; // Content ID from route parameter
  const { type } = req.query; // 'video', 'comment', or 'tweet'

  if (!id) {
    throw new apiError(400, 'Content ID is required');
  }

  if (!type || !['video', 'comment', 'tweet'].includes(type)) {
    throw new apiError(400, 'Content type (video, comment, or tweet) is required as query parameter');
  }

  const query = { [type]: id, likedBy: req.user._id };
  const like = await Like.findOne(query);
  
  const isLiked = !!like;

  return res.status(200).json(
    new apiResponse(200, { isLiked, contentId: id, contentType: type }, 'Like status checked successfully')
  );
});

export {
  createLike,
  removeLike,
  getLikesByUser,
  getLikesByVideo,
  getLikesByComment,
  getLikesByTweet,
  checkIfLiked,
};
