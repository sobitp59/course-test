import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  registerUser,
  getPurchasedCourses,
  purchaseCourse,
  getAllCourses,
} from '../controllers/user.controllers.js';
import { verifyUserJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').get((req, res) => {
  res.send('User Login Page');
});
router.route('/signup').post(registerUser);
router.route('/login').post(loginUser);
router.route('/courses').get(verifyUserJWT, getAllCourses);
router.route('/courses/purchased').get(verifyUserJWT, getPurchasedCourses);
// router.route('/courses/purchased').get((req, res) => {
//   res.json({ req: 'Hello' });
// });
router.route('/courses/:courseId').post(verifyUserJWT, purchaseCourse);
// router.route('/courses/:courseId').post((req, res) => {
//   res.send('User buy course');
// });

// secured routes
router.route('/logout').post(verifyUserJWT, logoutUser);
router.route('/refresh-token-user').post(refreshUserAccessToken);

export default router;
