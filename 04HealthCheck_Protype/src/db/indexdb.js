import mongoose from 'mongoose';
import { DATABASE_NAME } from '../constants.js';

const indexdb = async () => {
  try {
    const connectingURL = await mongoose.connect(
      `${process.env.MONGODBURL}/${DATABASE_NAME}`
    );
    console.log(connectingURL.model);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
