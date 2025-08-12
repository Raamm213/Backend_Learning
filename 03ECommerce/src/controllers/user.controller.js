import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { User } from '../models/user.models.js';
import mongoose from 'mongoose';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';

const registerUser = asynchandler(async (req, res) => {
  if (!req.body) {
    throw new apiError(400, 'full out the field body!!!!');
  }
  const { fullname, email, username, password } = req.body;
  if ([fullname, username, email, password].some(ele => ele?.trim() === '')) {
    throw new apiError(400, 'all fields are required');
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(400, 'user already existed!!!!');
  }
  // console.warn(req.files);
  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;

  if (!avatarPath) {
    throw new apiError(400, 'avatar image is missing');
  }

  let avatar1;
  try {
    avatar1 = await uploadOnCloudinary(avatarPath);
    // console.log('done', avatar1.url);
  } catch (err) {
    // console.log('error', err);
    throw new apiError(599, 'failed to upload to cloudinary');
  }

  let cover;
  if (coverImagePath) {
    try {
      cover = await uploadOnCloudinary(coverImagePath);
      // console.log('done', cover.url);
    } catch (err) {
      // console.log('error', err);
      throw new apiError(599, 'failed to upload to cloudinary');
    }
  }

  try {
    const userData = {
      fullname: fullname || 'this is for trail',
      username: username || 'this is for trail',
      email: email || 'this is for trail',
      avatar: avatar1.url,
      password: password || 'this is for trail',
    };

    // Only add coverImage if it exists
    if (cover && cover.url) {
      userData.coverImage = cover.url;
    }

    const user = await User.create(userData);

    const createdUser = await User.findById(user._id).select(
      '-password -refreshToken'
    );

    if (!createdUser) {
      throw new apiError(
        400,
        'something happened during the registaring the user'
      );
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          'you have successfully registered user in the db',
          user
        )
      );
  } catch (error) {
    // console.log('something wrong in the registering new user ');
    if (avatar1) {
      await deleteFromCloudinary(avatar1.public_id);
    }
    if (cover) {
      await deleteFromCloudinary(cover.public_id);
    }
    
    // Log the actual error for debugging
    console.error('User registration error:', error);
    
    // Check for specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new apiError(
        400,
        `${field} already exists. Please choose a different ${field}.`
      );
    }
    
    throw new apiError(
      400,
      `Registration failed: ${error.message || 'Unknown error occurred'}`
    );
  }
});

const generateAccessAndRefereshToken = async userId => {
  try {
    const user = await User.findById(userId);

    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();

    user.refreshToken = refreshtoken;
    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken };
  } catch (error) {
    console.log(
      'error in generating the new access token and refresh token',
      error
    );
    throw new apiError(
      404,
      error,
      'error in handling the generation of access token and the refresh token '
    );
  }

};

const logInUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !username || !password) {
    throw new apiError(
      404,
      'all username, email and password are necessary to proceed more!!!'
    );
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(404, 'User not found');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(404, 'invalid password');
  }

  const { accesstoken, refreshtoken } = await generateAccessAndRefereshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    semSite: 'strict',
  };

  return res
    .status(200)
    .cookie('accessToken', accesstoken, options)
    .cookie('refreshToken', refreshtoken, options)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, accesstoken, refreshtoken },
        'user logged in successfully'
      )
    );
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingRefereshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefereshToken) {
    throw new apiError(401, 'refresh token is required');
  }

  try {
    const verified = jwt.verify(
      incomingRefereshToken,
      process.env.REFRESH_SECRET_TOKEN
    );
    const user = await User.findById(verified?._id);
    if (!user) {
      throw new apiError(401, 'invalid refresh token');
    }
    if (incomingRefereshToken !== user?.refreshToken) {
      throw new apiError(401, 'invalid refresh token');
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    const { accesstoken, refreshtoken } = await generateAccessAndRefereshToken(
      user._id
    );

    return res
      .status(200)
      .cookie('accessToken', accesstoken, options)
      .cookie('refreshToken', refreshtoken, options)
      .json(
        new apiResponse(
          200,
          { accessToken: accesstoken, refreshToken: refreshtoken },
          'access token refreshed successfully'
        )
      );
  } catch (error) {
    throw new apiError(401, 'invalid refresh token');
  }
});

const logOutUser = asynchandler(async (req, res) => {
  await User.findByIdAndDelete(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
      new apiResponse(
        200,
        {},
        'user logged out successfully without any issues!!!!'
      )
    );
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    throw new apiError(400, 'Both old password and new password are required');
  }
  
  if (newPassword.trim() === '') {
    throw new apiError(400, 'New password cannot be empty');
  }
  
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new apiError(401, 'error in checking the user is valid or not ');
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new apiError(403, 'old password is incorrect ');
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {},
        'password is successfully changed without any error '
      )
    );
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        req.user?._id,
        'this is the requested user details!!'
      )
    );
});

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new apiError(402, 'please provide the fields that need to be update');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { user },
        'updated the accoutn details successfully!!!!'
      )
    );
});

const updateAvatarImage = asynchandler(async (req, res) => {
  const avatarPath = req.file?.path;

  if (!avatarPath) {
    throw new apiError(400, 'please attach the avatar file to update');
  }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarPath);
    
    if (!avatar) {
      throw new apiError(
        400,
        'Failed to upload avatar to cloudinary'
      );
    }
  } catch (error) {
    throw new apiError(
      400,
      `Avatar upload failed: ${error.message}`
    );
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      // If user update fails, delete the uploaded image
      await deleteFromCloudinary(avatar.public_id);
      throw new apiError(400, 'Failed to update user avatar');
    }

    return res
      .status(200)
      .json(new apiResponse(200, user, 'Successfully updated the avatar image'));
  } catch (error) {
    // If user update fails, delete the uploaded image
    await deleteFromCloudinary(avatar.public_id);
    throw error;
  }
});

const updateCoverImage = asynchandler(async (req, res) => {
  const coverImagePath = req.file?.path;

  if (!coverImagePath) {
    throw new apiError(400, 'Please attach the cover image file to update');
  }

  let cover;
  try {
    cover = await uploadOnCloudinary(coverImagePath);
    
    if (!cover) {
      throw new apiError(
        400,
        'Failed to upload cover image to cloudinary'
      );
    }
  } catch (error) {
    throw new apiError(
      400,
      `Cover image upload failed: ${error.message}`
    );
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: cover.url,
        },
      },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      // If user update fails, delete the uploaded image
      await deleteFromCloudinary(cover.public_id);
      throw new apiError(400, 'Failed to update user cover image');
    }

    return res
      .status(200)
      .json(new apiResponse(200, user, 'Successfully updated the cover image'));
  } catch (error) {
    // If user update fails, delete the uploaded image
    await deleteFromCloudinary(cover.public_id);
    throw error;
  }
});

const getUserChannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;

  if (!username.trim()) {
    throw new apiError(402, 'username is not defined');
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: '$subscribers',
        },
        channalSubscribedTo: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        email: 1,
        username: 1,
        coverImage: 1,
        avatarImage: 1,
        isSubscribed: 1,
        subscribersCount: 1,
      },
    },
  ]);

  console.log(channel);

  if (!channel?.length) {
    throw new apiError(402, 'channel not found');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        channel[0],
        'channel profile fetched successfully!!!!'
      )
    );
});

const getWatchHistory = asynchandler(async (req, res) => {

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ],
      },
    },
  ]);

  if(!user) {
    throw new apiError(402,"something is wrong in the aggregateting the watch the history")
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user[0]?.watchHistory,
        "successfully retrived the watch history!!!!"
      )
    )
});


export {
  registerUser,
  logInUser,
  refreshAccessToken,
  logOutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
