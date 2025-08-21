import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asynchandler } from '../utils/asynchandler.js';
import { Playlist } from '../models/playlist.models.js';

const createPlaylist = asynchandler(async (req, res) => {
  if (!req.user?._id) {
    throw new apiError(400, 'no req content is found');
  }

  const  owner  = req.user._id;
  const { name, description, videos } = req.body;

  const playlist = await Playlist.create({
    name,
    description: description || 'default',
    videos: videos || [],
    owner,
  });
  await playlist.save();


  return res
    .status(201)
    .json(new apiResponse(201, playlist, 'successfully created the playlist'));
});

const getById = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, 'something is wrong in the req body ');
  }

  const { id } = req.params;

  const ply = await Playlist.findById(id);

  if (!ply) {
    throw new apiError(400, 'cannot get the requested playlist');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        ply,
        'successfully retrieved the requested playlist by its id'
      )
    );
});

const getByUser = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(
      400,
      'please give some in the params to proceed furthur'
    );
  }

  const { id } = req.params;

  const ply = await Playlist.find({
    owner: id,
  });

  if (!ply) {
    throw new apiError(400, 'please provide the valid id to get the playlist');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        ply,
        'soccessfully retrived the data based on the user id'
      )
    );
});

const updatePlaylist = asynchandler(async (req, res) => {
  if (!req.params || !req.body) {
    throw new apiError(400, 'sorry nothing in the params to do something');
  }

  const { id } = req.params;
  const { name, description } = req.body;

  const ply = await Playlist.findByIdAndUpdate(
    id,
    { name, description },
    { new: true }
  );
  await ply.save();


  return res
    .status(200)
    .json(new apiResponse(200, ply, 'successfully updated the playlist!!!!!'));
});

const deletePlaylist = asynchandler(async (req, res) => {
  if (!req.params) {
    throw new apiError(400, 'sorry something wrong in the params');
  }

  const { id } = req.params;

  const ply = await Playlist.findOneAndDelete(id);

  return res
    .status(200)
    .json(new apiResponse(200, ply, 'successfully deleted the playlist'));
});

const addVideo = asynchandler(async (req, res) => {
  if (!req.params || !req.body) {
    throw new apiError(400, 'params not able to extract');
  }

  const { id } = req.params;
  const { video } = req.body;

  const ply = await Playlist.findById(id);

  if (!ply) {
    throw new apiError(400, 'cant find the playlist!!!!');
  }

  if (ply.videos.includes(video)) {
    throw new apiError(400, 'video already in the playlist');
  }

  ply.videos.push(video);
  await ply.save();

  return res
    .status(200)
    .json(
      new apiResponse(200, ply, 'successfully added the video to the playlist')
    );
});

const removeVideo = asynchandler(async (req, res) => {
  if (!req.params || !req.body) {
    throw new apiError(400, 'params not able to extract');
  }

  const { id } = req.params;
  const { video } = req.body;
  const ply = await Playlist.findById(id);

  if (!ply) {
    throw new apiError(400, 'cant find the playlist!!!!');
  }

  if (!ply.videos.includes(video)) {
    throw new apiError(400, 'video is not in the playlist');
  }

  ply.videos = ply.videos.filter(v => v.toString() !== video);
  await ply.save();

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        ply,
        'successfully removed the video from  the playlist'
      )
    );
});

export {
  createPlaylist,
  getById,
  getByUser,
  updatePlaylist,
  deletePlaylist,
  addVideo,
  removeVideo,
};
