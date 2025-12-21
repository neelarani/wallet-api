import { AppError } from '@/app/errors';
import {
  catchAsync,
  createUserTokens,
  HTTP_CODE,
  sendResponse,
  setAuthCookie,
} from '@/shared';
import passport from 'passport';
import { IUser } from '../user/user.interface';
import * as service from './auth.service';
import { ENV } from '@/config';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import { Wallet } from '../wallet/wallet.model';

export const credentialLogin = catchAsync(async (req, res, next) => {
  passport.authenticate(
    'local',
    async (err: any, user: Partial<IUser>, info: any) => {
      if (err) return next(new AppError(HTTP_CODE.UNAUTHORIZED, err));

      if (!user)
        return next(new AppError(HTTP_CODE.UNAUTHORIZED, info?.message));

      const { password, ...rest } = (user as any).toObject();

      const tokens = createUserTokens(user);

      setAuthCookie(res, tokens);

      sendResponse(res, {
        success: true,
        status: HTTP_CODE.CREATED,
        message: 'User logged successfully',
        data: { tokens, user: rest },
      });
    }
  )(req, res, next);
});

export const getNewAccessToken = catchAsync(async (req, res) => {
  const tokenInfo = await service.getNewAccessToken(req.cookies.refreshToken);

  setAuthCookie(res, tokenInfo);

  sendResponse<{
    accessToken: string;
  }>(res, {
    success: true,
    status: HTTP_CODE.CREATED,
    message: 'New access token successfully generated',
    data: tokenInfo,
  });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 0,
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 0,
  });
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: 'Logged Out',
  });
});

export const getVerifyUserSecret = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: `User verification link has been sended successfully!`,
    data: await service.getVerifyUserSecret(req.body.email),
  });
});

export const verifyUser = catchAsync(async (req, res) => {
  const verifiedUser = await service.verifyUser(
    (req.query as Record<string, string>).secret
  );

  return !verifiedUser
    ? res.redirect(`${ENV.FRONTEND_BASE_URL}/login`)
    : (() => {
        setAuthCookie(res, createUserTokens(verifiedUser));
        res.redirect(`${ENV.FRONTEND_BASE_URL}`);
      })();
});

export const setPassword = catchAsync(async (req, res) => {
  sendResponse<void>(res, {
    success: true,
    status: HTTP_CODE.CREATED,
    message: 'Password has been reset successfully!',
    data: await service.setPassword(
      (req.user as JwtPayload).userId,
      req.body?.password
    ),
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  sendResponse<void>(res, {
    success: true,
    status: HTTP_CODE.CREATED,
    message: 'Reset Password Email has been sended!',
    data: await service.forgotPassword(req.body?.email),
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  sendResponse<void>(res, {
    success: true,
    status: HTTP_CODE.CREATED,
    message: 'Password has been reset successfully!',
    data: await service.resetPassword(
      req.body.password as string,
      req.query.resetToken as string
    ),
  });
});

export const changePassword = catchAsync(async (req, res) => {
  sendResponse<void>(res, {
    success: true,
    status: HTTP_CODE.CREATED,
    message: 'Password has been changed successfully!',
    data: await service.changePassword(
      req.body.oldPassword,
      req.body.newPassword,
      req.user as JwtPayload
    ),
  });
});

export const googleLogin = catchAsync(async (req, res, next) => {
  const redirect = req.query.redirect || ('/' as string);
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: redirect as string,
  })(req, res, next);
});

export const googleCallback = catchAsync(async (req, res) => {
  const user = req.user as Partial<IUser> | undefined;

  if (!user) throw new AppError(HTTP_CODE.NOT_FOUND, 'User Not Found!');

  let wallet = await Wallet.findOne({ user: user._id });

  if (!wallet) {
    wallet = await Wallet.create({
      balance: ENV.WALLET_INITIAL_BALANCE,
      user: user._id,
    });
    await User.findByIdAndUpdate(
      user._id,
      { wallet: wallet._id },
      { new: true }
    );
  }

  const state = req.query?.state as string;
  const tokenInfo = createUserTokens(req.user as IUser);

  setAuthCookie(res, tokenInfo);
  res.redirect(
    `${ENV.FRONTEND_BASE_URL}/${!state.startsWith('/') ? state : ''}`
  );
});
