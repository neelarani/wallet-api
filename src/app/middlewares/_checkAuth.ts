import { AppError } from '@/app/errors';
import { catchAsync, verifyToken, HTTP_CODE } from '@/shared';
import { ENV } from '@/config';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import { IsActive } from '../modules/user/user.interface';

export const checkAuth = (...authRoles: string[]) =>
  catchAsync(async (req, res, next) => {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!accessToken) throw new AppError(403, 'No Token Received!');

    const verifiedToken = verifyToken(
      accessToken,
      ENV.JWT_ACCESS_SECRET
    ) as JwtPayload;

    const user = await User.findOne({ email: verifiedToken.email });

    if (!user) throw new AppError(HTTP_CODE.BAD_REQUEST, 'User does not Exist');

    if (
      user.isActive === IsActive.BLOCKED ||
      user.isActive === IsActive.INACTIVE
    )
      throw new AppError(HTTP_CODE.BAD_REQUEST, `User is ${user.isActive}`);

    if (user.isDeleted)
      throw new AppError(HTTP_CODE.BAD_REQUEST, 'User is deleted');

    const userRole = verifiedToken.role?.toUpperCase();
    const allowedRoles = authRoles.map(r => r.toUpperCase());
    if (!allowedRoles.includes(userRole!)) {
      throw new AppError(
        HTTP_CODE.FORBIDDEN,
        'You are not permitted to view this route'
      );
    }

    req.user = verifiedToken;
    next();
  });
