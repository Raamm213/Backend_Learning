import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asynchandler } from '../utils/asynchandler.js';
import {Subscription} from '../models/subscription.models.js';

const subscribe = asynchandler(async (req, res) => {
  if (!req.body) {
    throw new apiError(400, 'something wrong in the ');
  }

  const user = req.user?._id;

  const { channel } = req.body;

  const sub = await Subscription.create({
    subscriber: user,
    channel,
  });

  if (!sub) {
    throw new apiError(400, 'something wrong in the sub retrivel');
  }

  return res
    .status(201)
    .json(new apiResponse(201, sub, 'successfully created the subscription'));
});

const unsubscribe = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, 'something wrong in the ');
  }

  const user = req.user?._id;
  const {channel} = req.params;

  const sub = await Subscription.findOneAndDelete({
    subscriber: user,
    channel,
  });

  if (!sub) {
    throw new apiError(
      400,
      'there is no channel named like that you subscribed to'
    );
  }

  return res
    .status(200)
    .json(new apiResponse(200, sub, 'successfully unsebscibed the channel'));
});

const getSubscriptionsByUser = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, 'something wrong in the ');
  }

  const {user} = req.params;

  const sub = await Subscription.find({
    subscriber: user,
  });

  if (!sub || sub.length === 0) {
    throw new apiError(
      400,
      "can't find the channels that are subscribed by the user"
    );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        sub,
        'successfully retrieved the channels that are being subscribed by the user'
      )
    );
});

const getSubscribersOfChannel = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, 'something wrong in the ');
  }

  const {channel} = req.params;

  const sub = await Subscription.find({
    channel,
  }).populate("subscriber", "username email");

  if (!sub || sub.length === 0) {
    throw new apiError(
      400,
      "can't find the user that are being subscribed to this channel"
    );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        sub,
        'successfully retrieved the users that are being subscribed to the channel'
      )
    );
});

const checkIfSubscribed = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, 'something wrong in the ');
  }

  const {channel} = req.params;
  const user = req.user?._id;

  const sub = await Subscription.findOne({
    subscriber: user,
    channel,
  });

  if (!sub) {
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          'not subscribed'
        )
      );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        sub,
        'user is subscribed'
      )
    );
});

export {
  subscribe,
  unsubscribe,
  getSubscriptionsByUser,
  getSubscribersOfChannel,
  checkIfSubscribed,
};
