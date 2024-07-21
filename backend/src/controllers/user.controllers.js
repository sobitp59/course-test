import { mongoose } from 'mongoose';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Course } from '../models/course.model.js';
import jwt from 'jsonwebtoken';
export async function generateAcessAndRefreshToken(userId) {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    console.log('Access Token : ', accessToken);
    console.log('Refresh Token : ', refreshToken);

    user.refreshToken = refreshToken;
    await user.save();

    console.log(accessToken, refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating access and refresh tokens.'
    );
  }
}

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === '')) {
    const err = new ApiError(400, 'All fields are required');
    return res.status(400).json({ ...err, message: err.message });
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    // throw
    const err = new ApiError(409, 'User already exists. Please login');
    return res.status(400).json({ ...err, message: err.message });
  }

  const user = await User.create({
    username: username.trim().toLowerCase(),
    password,
    email,
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    const err = new ApiError(
      500,
      'Something went wrong while regisetring the user. Please try again later'
    );
    return res.status(500).json({ ...err, message: err.message });
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered successfully'));
}

async function loginUser(req, res) {
  const { username, email, password } = req.body;

  if (!username && !email) {
    const err = new ApiError(400, 'Please provide either email or username');
    return res.status(400).json({ ...err, message: err.message });
  }

  if (!password) {
    const err = new ApiError(400, 'Password is required');
    return res.status(400).json({ ...err, message: err.message });
  }

  const user = await User.findOne({
    $or: [{ username: username?.trim().toLowerCase() }, { email }],
  });

  if (!user) {
    const err = new ApiError(404, 'User doest not exist');
    return res.status(404).json({ ...err, message: err.message });
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    const err = new ApiError(401, 'Invalid user credentials');
    return res.status(401).json({ ...err, message: err.message });
  }

  const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessTokenUser', accessToken, options)
    .cookie('refreshTokenUser', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        'User logged in successfully'
      )
    );
}

async function logoutUser(req, res) {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessTokenUser', options)
    .clearCookie('refreshTokenUser', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
}

async function refreshUserAccessToken(req, res) {
  const incomingRefreshToken =
    req.headers?.authorization?.replace('Bearer ', '') ||
    req.cookies.refreshTokenUser ||
    req.body.refreshTokenUser;

  if (!incomingRefreshToken) {
    const err = new ApiError(400, 'Unauthorized request');
    res.status(400).json({ ...err, message: err.message });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      const err = new ApiError(401, 'Invalid refresh token');
      res.status(401).json({ ...err, message: err.message });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      const err = new ApiError(401, 'Refresh token is expired');
      res.status(401).json({ ...err, message: err.message });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie('accessTokenUser', accessToken, options)
      .cookie('refreshTokenUser', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    const err = new ApiError(401, 'Invalid refresh token');
    return res.status(401).json({ ...err, message: err.message });
  }
}

async function purchaseCourse(req, res) {
  const courseId = req.params.courseId.trim().toString();

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      const err = new ApiError(400, 'No course found');
      res.status(400).json({ ...err, message: err.message });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { purchasedCourses: courseId } },
      { new: true }
    );

    const course = await Course.findById(courseId);

    if (!course) {
      const err = new ApiError(400, 'Unauthorized');
      res.status(400).json({ ...err, message: err.message });
    }

    res
      .status(200)
      .json(new ApiResponse(200, course, 'Course purchased successfully'));
  } catch (error) {
    const err = new ApiError(400, 'Failed to purchase course');
    res.status(400).json({ ...err, message: err.message });
  }
}

async function getPurchasedCourses(req, res) {
  try {
    const courses = await User.findById(req.user._id)?.populate(
      'purchasedCourses'
    );

    if (!courses) {
      const err = new ApiError(400, 'No courses found');
      res.status(400).json({ ...err, message: err.message });
    }

    res.status(200).json(
      new ApiResponse(200, {
        purchasedCourses: courses.purchasedCourses,
      })
    );
  } catch (error) {
    const err = new ApiError(400, 'Failed to get courses');
    res.status(400).json({ ...err, message: err.message });
  }
}

async function getAllCourses(req, res) {
  try {
    const courses = await Course.find();
    res.status(200).json(new ApiResponse(200, courses));
  } catch (error) {
    const err = new ApiError(400, 'No courses found');
    res.status(400).json({ ...err, message: err.message });
  }
}

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  getPurchasedCourses,
  purchaseCourse,
  getAllCourses,
};
