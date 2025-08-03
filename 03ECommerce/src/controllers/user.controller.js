import { Router } from 'express';
import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
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
    throw new apiError(
      400,
      'something happened during the registaring the user,so deleted the images'
    );
  }
});

const generateAccessAndRefereshToken = async userId => {
  try {
    const user = User.findById(userId);

    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();

    user.refreshToken = refreshtoken;
    await user.schemaLevelProjections({ validateBeforeSave: false });
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

  return { accesstoken, refreshtoken };
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

const refreshAccessToken = asynchandler(async (res, req) => {
  const incomingRefereshToken =
    req.cookies.refreshToken || req.body.refreshToken;

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

    options = {
      httpOnly: true,
      secure: process.env.NODE_ENV,
    };

    const { accesstoken, newrefresh } = await generateAccessAndRefereshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken",accesstoken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
        new apiError(
          200,
          {accessToken,refreshToken:newrefresh},
          "access token refreshed successfully"
        )
      )
  } catch (error) {
    throw new apiError(401, 'invalid refesh token');
  }
});

const logOutUser = asynchandler(async (req,res) => {
  await User.findByIdAndDelete(
    ///something has tobe done to find the perticular user 
    
  )
})
export { registerUser, logInUser, refreshAccessToken };
