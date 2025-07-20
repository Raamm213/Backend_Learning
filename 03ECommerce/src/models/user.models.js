import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
  {
    username: {
      type: string,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: string,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: string,
      required: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: string,
      required: true,
    },
    coverImage: {
      type: string,
      required: true,
    },
    watcHistory: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    watcHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    passward: {
      type: string,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: string,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.modified('password')) return next();
  this.passward =await bcrypt.hash(this.passward, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (passord) {
  return await bcrypt.compare(passord, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.JWT_SECRET_TOKEN,
    { expiresIn: process.env.JWT_EXPIRE_TIME }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_SECRET_TOKEN,
    { expiresIn: process.env.REFRESH_EXPIRE_TIME }
  );
};

export const User = mongoose.model('User', userSchema);
