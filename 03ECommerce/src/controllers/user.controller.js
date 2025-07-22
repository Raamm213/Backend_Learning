import { Router } from 'express';
import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';

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
  const avatarPath = req.files?.avatar[0]?.path;
  const coverImagePath = req.files?.coverImage[0]?.path;

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
  try {
    cover = await uploadOnCloudinary(coverImagePath);
    // console.log('done', cover.url);
  } catch (err) {
    // console.log('error', err);
    throw new apiError(599, 'failed to upload to cloudinary');
  }

  try {
    const user = await User.create({
      fullname: fullname || 'this is for trail',
      username: username || 'this is for trail',
      email: email || 'this is for trail',
      avatar: avatar1.url,
      coverImage: cover.url,
      password: password || 'this is for trail',
    });

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

export { registerUser };
