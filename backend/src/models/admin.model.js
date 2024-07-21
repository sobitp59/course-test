import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const adminSchema = new Schema(
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
    courses: [
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

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  console.log('PS', this.password);
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = async function () {
  try {
    const accessToken = jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
        role: 'ADMIN',
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
      }
    );
    console.log('Access token generated : ', accessToken);
    return accessToken;
  } catch (error) {
    console.log('Failed to generate access token');
    throw new Error('Failed to generate access token');
  }
};

adminSchema.methods.generateRefreshToken = async function () {
  try {
    const refreshToken = jwt.sign(
      {
        _id: this._id,
        username: this.email,
        email: this.email,
        role: 'ADMIN',
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
      }
    );

    console.log('Refresh Token Generated ', refreshToken);
    return refreshToken;
  } catch (error) {
    console.log('Failed to generate refresh token');
    throw new Error('Failed to generate refresh token');
  }
};

export const Admin = mongoose.model('Admin', adminSchema);
