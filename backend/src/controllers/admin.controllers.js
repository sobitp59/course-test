import { Admin } from '../models/admin.model.js';
import { Course } from '../models/course.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

async function generateAccessAndRefreshToken(adminId) {
  try {
    const admin = await Admin.findById(adminId);

    const accessToken = await admin.generateAccessToken();
    const refreshToken = await admin.generateRefreshToken();

    console.log('Access Token : ', accessToken);
    console.log('Refresh Token : ', refreshToken);

    admin.refreshToken = refreshToken;
    await admin.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating access and refresh tokens'
    );
  }
}

async function registerAdmin(req, res) {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === '')) {
    const err = new ApiError(400, 'All fields are required');
    return res.status(400).json({ ...err, message: err.message });
  }

  const existedUser = await Admin.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    const err = new ApiError(
      409,
      'Account already exists with this email. Please login'
    );
    return res.status(400).json({ ...err, message: err.message });
  }

  const admin = await Admin.create({
    username: username.trim().toLowerCase(),
    password,
    email,
  });

  const createdAdmin = await Admin.findById(admin._id).select(
    '-password -refreshToken'
  );

  if (!createdAdmin) {
    const err = new ApiError(
      500,
      'Something went wrong while registering the admin'
    );
    return res.status(500).json({ ...err, message: err.message });
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, 'Admin registered successfully'));
}

async function loginAdmin(req, res) {
  const { username, email, password } = req.body;

  if (!username && !email) {
    const err = new ApiError(400, 'Please provide either email or username');
    return res.status(400).json({ ...err, message: err.message });
  }

  if (!password) {
    const err = new ApiError(400, 'Password is required');
    return res.status(400).json({ ...err, message: err.message });
  }

  const admin = await Admin.findOne({
    $or: [{ username: username?.trim().toLowerCase() }, { email }],
  });

  if (!admin) {
    const err = new ApiError(404, 'Admin doest not exist');
    return res.status(404).json({ ...err, message: err.message });
  }

  const isPasswordCorrect = await admin.isPasswordCorrect(password);

  console.log('PASSWORD', isPasswordCorrect);
  console.log('PASSWORD', password);

  if (!isPasswordCorrect) {
    const err = new ApiError(401, 'Invalid credentials');
    return res.status(401).json({ ...err, message: err.message });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id
  );

  const loggedInAdmin = await Admin.findById(admin._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessTokenAdmin', accessToken, options)
    .cookie('refreshTokenAdmin', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { admin: loggedInAdmin, accessToken, refreshToken },
        'Admin logged in successfully'
      )
    );
}

async function logoutAdmin(req, res) {
  await Admin.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessTokenAdmin', options)
    .clearCookie('refreshTokenAdmin', options)
    .json(new ApiResponse(200, {}, 'Admin logged out successfully'));
}

async function refreshAdminAccessToken(req, res) {
  const incomingRefreshToken =
    req.cookies.refreshAdminAccessToken || req.body.refreshAdminAccessToken;

  if (!incomingRefreshToken) {
    const err = new ApiError(400, 'Unauthorized request');
    res.status(400).json({ ...err, message: err.message });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    console.log('Decoded token ', decodedToken);

    const admin = await Admin.findById(decodedToken._id);

    if (!admin) {
      const err = new ApiError(401, 'Invalid refresh token');
      res.status(401).json({ ...err, message: err.message });
    }

    if (incomingRefreshToken !== admin.refreshToken) {
      const err = new ApiError(401, 'Refresh token is expired');
      res.status(401).json({ ...err, message: err.message });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      admin._id
    );

    return res
      .status(200)
      .cookie('accessTokenAdmin', accessToken, options)
      .cookie('refreshTokenAdmin', refreshToken, options)
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

async function postCourse(req, res) {
  const { title, description, price, bannerUrl } = req?.body;

  if (!title || !description || !price || !bannerUrl) {
    const err = new ApiError(411, 'All fields are required');
    console.log('erroror');
    return res.status(411).json({ ...err, message: err.message });
  }

  try {
    const newCourse = {
      title,
      description,
      price,
      bannerUrl,
      owner: req.user._id,
    };

    const course = await Course.create(newCourse);

    await Admin.findByIdAndUpdate(
      req.user._id,
      {
        $push: { courses: course._id },
      },
      { new: true }
    );

    res
      .status(201)
      .json(new ApiResponse(201, course, 'Course posted successfully'));
  } catch (error) {
    const err = new ApiError(500, 'Failed to create course');
    res.status(500).json({ ...err, message: err.message });
  }
}

async function getAllCourses(req, res) {
  try {
    const courses = await Admin.findById(req.user._id)?.populate('courses');

    if (!courses) {
      const err = new ApiError(400, 'No course found');
      return res.status(400).json({ ...err, message: err.message });
    }

    return res.status(200).json(new ApiResponse(200, courses.courses));
  } catch (error) {
    const err = new ApiError(400, 'Failed to get courses');
    return res.status(400).json({ ...err, message: err.message });
  }
}

export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminAccessToken,
  postCourse,
  getAllCourses,
};
