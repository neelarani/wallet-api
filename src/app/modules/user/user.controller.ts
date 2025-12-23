import {
  catchAsync,
  createUserTokens,
  HTTP_CODE,
  sendResponse,
  setAuthCookie,
} from '@/shared';
import * as service from './user.service';
import { JwtPayload } from 'jsonwebtoken';
import { IUser } from './user.interface';

export const registerUser = catchAsync(async (req, res) => {
  const user = (await service.registerUser(req.body)) as Partial<IUser>;

  setAuthCookie(res, createUserTokens(user));

  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'User registration has been completed successfully!',
    data: user,
  });
});

export const editProfile = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'User profile updated successfully!',
    data: await service.editProfile(
      req.user as JwtPayload,
      req.file as Express.Multer.File,
      req.body
    ),
  });
});

export const updatePassword = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'Password updated!',
    data: await service.updatePassword(req.user as JwtPayload, req.body),
  });
});

export const getAllUsers = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'Retrieve all user successfully!',
    ...(await service.getAllUsers(req.query as Record<string, string>)),
  });
});

export const getSingleUser = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'Retrieve user successfully!',
    data: await service.getSingleUser(req.params.id),
  });
});

export const getMyProfile = catchAsync(async (req, res) => {
  const user = await service.getMyProfile(req.user as JwtPayload);
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'Retrieve myProfile successfully!',
    data: user,
  });
});

export const requestForAgent = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'Request for agent has been sended successfully!',
    data: await service.requestForAgent(req.user as JwtPayload),
  });
});
