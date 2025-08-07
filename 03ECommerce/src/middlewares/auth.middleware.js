import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const authMiddle = asynchandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new apiError(401, 'unAuthorized ');
  }

  try {

    const extractedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const user = await User.findById(extractedToken?._id).select('-password -refreshToken');

    if(!user) {
        throw new apiError(401,"Unauthorized!!!!");
    }

    req.user = user

    next()

  } catch (error) { 
    throw new apiError(401, 'unAuthorized entry');
  }
});

export default authMiddle;
