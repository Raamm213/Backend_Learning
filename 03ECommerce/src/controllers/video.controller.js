import { asynchandler } from '../utils/asynchandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Video } from '../models/video.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const createVideo = asynchandler(async (req, res) => {
  const { title, description, duration, isPublished } = req.body;
  const videoFile = req.files?.videoFile[0]?.path;
  const thumbnail = req.files?.thumbnail[0]?.path;
  const owner = req.user?._id;

  if (!title || !description || !duration)
    throw new apiError(400, 'sorry somethign wrong in the body retrival');
  if (!videoFile) throw new apiError(400, 'video file is missing');
  if (!thumbnail) throw new apiError(400, 'thumbnail is missing');

  let videoFile1, thumbnail1;
  try {
    videoFile1 = await uploadOnCloudinary(videoFile);
    thumbnail1 = await uploadOnCloudinary(thumbnail);
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new apiError(500, 'failed to upload to Cloudinary');
  }

  const video = await Video.create({
    videoFile: videoFile1.url,
    thumbnail: thumbnail1.url,
    title,
    description,
    duration,
    isPublished,
    owner,
  });

  if (!video)
    throw new apiError(
      400,
      'sorry something is wrong in the creating video file'
    );

  const populatedVideo = await video.populate('owner', 'username email');

  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        populatedVideo,
        'successfully created the video file'
      )
    );
});
const getVideoById = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'sorry cant take the id value from the params');
  }

  const vid = await Video.findById(id).populate('owner', 'username email');

  if (!vid) {
    throw new apiError(400, 'nothing such video exists');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, vid, 'successfully retrieved the video by its id!!!')
    );
});
const getVideosByChannel = asynchandler(async (req, res) => {
  const { channel } = req.params;

  if (!channel) {
    throw new apiError(400, 'sorry cant take the id value from the params');
  }

  const vid = await Video.find({
    owner: channel,
  }).populate('owner', 'username email');

  if (!vid) {
    throw new apiError(400, 'nothing such video exists');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        vid,
        'successfully retrieved the video by its channel id number'
      )
    );
});
const updateVideo = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'sorry cant take the id value from the params');
  }

  const vid = await Video.findByIdAndUpdate(id, req.body, {
    new: true,
  }).populate('owner', 'username email'); //TODO HAVE TO MARK THE UPDATE THINGS IN THE PARANTESIS

  if (!vid) {
    throw new apiError(400, 'nothing such video exists');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, vid, 'successfully deleted the video by its id!!!')
    );
});
const deleteVideo = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'sorry cant take the id value from the params');
  }

  const vid = await Video.findByIdAndDelete(id).populate(
    'owner',
    'username email'
  );

  if (!vid) {
    throw new apiError(400, 'nothing such video exists');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, vid, 'successfully deleted the video by its id!!!')
    );
});
const togglePublish = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'sorry cant take the id value from the params');
  }

  const video = await Video.findById(id);
  if (!video) throw new apiError(400, 'nothing such video exists');

  video.isPublished = !video.isPublished;
  await video.save();

  const populatedVideo = await video.populate('owner', 'username email');

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        populatedVideo,
        'successfully toggled the publish video by its id!!!'
      )
    );
});
const incrementViews = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, 'cant have the channel id');
  }

  const vid = await Video.findByIdAndUpdate(id,{$inc: {views:1}},{new:true}).populate("owner","username email");

  return res.status(200).json(new apiResponse(200, vid,  'watching the video'));
}); //TODO HAVE OT COMPLETE THIS

export {
  createVideo,
  getVideoById,
  getVideosByChannel,
  updateVideo,
  deleteVideo,
  togglePublish,
  incrementViews,
};
