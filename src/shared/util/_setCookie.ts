import { ENV } from '@/config';
import { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const setAuthCookie = (
  res: Response,
  tokens: { accessToken?: string; refreshToken?: string }
) => {
  if (tokens.accessToken) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 86400000,
    });
  }
  if (tokens.refreshToken) {
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 604800000,
    });
  }
};
