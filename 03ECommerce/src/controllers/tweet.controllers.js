import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asynchandler } from '../utils/asynchandler.js';
import { Tweet } from '../models/tweet.models.js';

const createTweet = asynchandler(async (req, res) => {
  if (!req.body) {
    throw new apiError(400, "can't find the body contents");
  }

  const user = req.user?._id;
  const {content} = req.body;

  const tweet = await Tweet.create({
    content,
    owner: user,
  });

  await tweet.populate("owner", "username email")

  if (!tweet) {
    throw new apiError(400, 'sorry something wrong in the creating tweet');
  }

  return res
    .status(201)
    .json(new apiResponse(201, tweet, 'successfully created the tweet!!!'));
});

const getById = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, "can't find the params details");
  }

  const { id } = req.params;

  const tweet = await Tweet.findById(id);

  if (!tweet) {
    throw new apiError(400, 'sorry cant find such tweet in the database');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        tweet,
        'successfully retrieved the tweet by its id!!!'
      )
    );
});

const getByChannel = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, "can't find the params details");
  }

  const { channel } = req.params;

  const tweet = await Tweet.find({
    owner: channel,
  }).populate('owner', 'username email');

  if (!tweet) {
    throw new apiError(400, 'sorry there is no such tweet!!!');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        tweet,
        'successfully retrieved the tweet by its channel id'
      )
    );
});

const updateTweet = asynchandler(async (req, res) => {
  if (!req.params || !req.body) {
    throw new apiError(400, "can't find the params details");
  }

  const { id } = req.params;
  const { content } = req.body;

  const tweet = await Tweet.findByIdAndUpdate(id, { content }, { new: true });

  if (!tweet) {
    throw new apiError(400, 'sorry nothing has been updated!!!');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, tweet, 'successfully updated the tweet by its id')
    );
});

const deleteTweet = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, "can't find the params details");
  }

  const { id } = req.params;

  const tweet = await Tweet.findByIdAndDelete(id);

  if (!tweet) {
    throw new apiError(400, 'No tweet found to delete');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, tweet, 'successfully delted the tweet by its id!!!')
    );
});

export { createTweet, getById, getByChannel, updateTweet, deleteTweet };
