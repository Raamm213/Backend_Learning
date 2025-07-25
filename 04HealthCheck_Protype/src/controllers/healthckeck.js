import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';

const healthcheck = asyncHandler(async (req, res) => {
  return res.status(200).json(new apiResponse(200, 'this is data'));
});


export { healthcheck}