import { Router } from 'express';
import {
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  refreshAdminAccessToken,
  postCourse,
  getAllCourses,
} from '../controllers/admin.controllers.js';
import { verifyAdminJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').get((req, res) => {
  res.send('admin home page');
});
router.route('/signup').post(registerAdmin);
router.route('/login').post(loginAdmin);

// GET ALL POSTED COURSES
// router.route('/courses').get((req, res) => {
//   res.send('all courses page');
// });

// POST A COURSE ROUTE
router.route('/courses').get(verifyAdminJWT, getAllCourses);
router.route('/courses/:courseId').post((req, res) => {
  res.send('course published/unpublished');
});

// secured routes
router.route('/courses').post(verifyAdminJWT, postCourse);
router.route('/logout').post(verifyAdminJWT, logoutAdmin);
router
  .route('/refresh-token-admin')
  .post(verifyAdminJWT, refreshAdminAccessToken);

export default router;
