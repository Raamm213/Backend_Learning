import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import 'dotenv/config';

const indexdb = async () => {
  try {
    const connecturl = await mongoose.connect(
      `${process.env.MONGODBURL}/${DB_NAME}`
    );
    console.log(connecturl.Schema.ObjectId)
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default indexdb