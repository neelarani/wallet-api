import { Router } from 'express';
import { checkAuth, multerUpload, validateRequest } from '@/app/middlewares';
import * as controller from './user.controller';
import * as validator from './user.validation';
import { Role } from './user.interface';

const router = Router();

router.post(
  '/register',
  validateRequest(validator.zCreateUserSchema),
  controller.registerUser
);

router.patch(
  '/edit',
  checkAuth(...Object.values(Role)),
  multerUpload.single('file'),
  validateRequest(validator.zUpdateUserSchema),
  controller.editProfile
);

router.patch(
  '/update-password',
  checkAuth(...Object.values(Role)),
  validateRequest(validator.zUpdatePasswordSchema),
  controller.updatePassword
);

router.get(
  '/get-all-users',
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  controller.getAllUsers
);

router.get('/me', checkAuth(...Object.values(Role)), controller.getMyProfile);

router.get(
  '/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  controller.getSingleUser
);

router.post(
  '/request-for-agent',
  checkAuth(Role.USER),
  controller.requestForAgent
);

export default router;
