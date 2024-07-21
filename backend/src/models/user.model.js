import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    purchasedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // this.password = await bcrypt.hash(this.password, 10);
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  try {
    const accessToken = await jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
        role: 'USER',
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
      }
    );
    console.log('Access token generated : ', accessToken);
    return accessToken;
  } catch (error) {
    console.log('Failed to generated access token : ', error);
    throw new Error('Failed to generated access token ');
  }
};

userSchema.methods.generateRefreshToken = async function () {
  try {
    const refreshToken = jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
        role: 'USER',
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
      }
    );
    console.log('Refresh token generated : ', refreshToken);
    return refreshToken;
  } catch (error) {
    console.log('Failed to generated refresh token : ', error);
    throw new Error('Failed to generated refresh token');
  }
};

export const User = mongoose.model('User', userSchema);
