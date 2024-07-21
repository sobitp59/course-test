import { Admin } from '../models/admin.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
export async function verifyUserJWT(req, res, next) {
  try {
    const token =
      req.headers?.authorization?.replace('Bearer ', '') ||
      req.cookies.accessTokenUser;

    if (!token) {
      const err = new ApiError(401, 'Unathorized request');
      return res.status(401).json({ ...err, message: req.message });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('DECODED TOKEN ', decodedToken);

    const user = await User.findById(decodedToken._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      const err = new ApiError(401, 'Invalid access token');
      return res.status(401).json({ ...err, message: err.message });
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new ApiError(401, 'Invalid access token');
    return res
      .status(401)
      .json({ ...err, message: error.message || err.message });
  }
}
export async function verifyAdminJWT(req, res, next) {
  try {
    const token =
      req.headers?.authorization?.replace('Bearer ', '') ||
      req.cookies.accessTokenAdmin;

    if (!token) {
      const err = new ApiError(401, 'Unathorized request');
      return res.status(401).json({ ...err, message: req.message });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Admin.findById(decodedToken._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      const err = new ApiError(401, 'Invalid access token');
      return res.status(401).json({ ...err, message: err.message });
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new ApiError(401, 'Invalid access token');
    return res
      .status(401)
      .json({ ...err, message: error.message || err.message });
  }
}
