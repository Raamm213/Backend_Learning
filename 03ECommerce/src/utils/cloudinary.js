import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const uploadOnCloudinary = async localFilePath => {
  // console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    // console.log(
    //   'this is the upload result that came as a output',
    //   uploadResult.url
    // );
    fs.unlinkSync(localFilePath); //this is used to unmount the local file after the successful upload to cloudinary cloud
    return uploadResult;
  } catch (error) {
    // console.log("Erroe that you are expecting ,", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const  deleteFromCloudinary = async (publicID)=> {
  try {
    const result = cloudinary.uploader.destroy(publicID)
    // console.log("successfully deleted", result)
  } catch (error) {
    // console.log("errro in deleting the cloudinary",error)
  }
}

export { uploadOnCloudinary, deleteFromCloudinary };
