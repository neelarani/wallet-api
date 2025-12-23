import { AppError } from '@/app/errors';
import { IAuthProvider, IToAgentStatus, IUser, Role } from './user.interface';
import { ToAgent, User } from './user.model';
import bcryptjs from 'bcryptjs';
import { ENV } from '@/config';
import { useQuery } from 'mongoose-qb';
import { Wallet } from '../wallet/wallet.model';
import { JwtPayload } from 'jsonwebtoken';
import { HTTP_CODE, sendMail, uploadToCloudinary } from '@/shared';

export const registerUser = async (Payload: IUser) => {
  const { email, password, phone, ...rest } = Payload || {};

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError(400, 'User already exists with the same email!');
    }
    if (existingUser.phone === phone) {
      throw new AppError(400, 'User already exists with the same phone!');
    }
  }

  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email,
  };

  const hashPassword = bcryptjs.hashSync(
    password,
    bcryptjs.genSaltSync(ENV.BCRYPT_SALT_ROUND)
  );

  let user = await User.create({
    email,
    phone,
    ...rest,
    auths: [authProvider],
    password: hashPassword,
  });

  const wallet = await Wallet.create({
    balance: ENV.WALLET_INITIAL_BALANCE,
    user: user._id,
  });

  return await User.findByIdAndUpdate(
    user._id,
    { wallet: wallet._id },
    { new: true }
  );
};

export const editProfile = async (
  decodedToken: JwtPayload,
  file?: Express.Multer.File,
  data?: IUser
) => {
  let user = await User.findById(decodedToken.userId);

  if (!user) throw new AppError(HTTP_CODE.NOT_FOUND, `User not found`);

  if (data?.phone) {
    const userByPhone = await User.findOne({ phone: data.phone });
    if (userByPhone && userByPhone?._id.toString() !== user._id.toString()) {
      throw new AppError(
        HTTP_CODE.BAD_REQUEST,
        `This phone number has been used already in another account!`
      );
    }
  }

  if (file) {
    const upload = await uploadToCloudinary(file);
    user = await User.findByIdAndUpdate(
      user._id,
      {
        picture: upload.secure_url,
      },
      { new: true, runValidators: true }
    );

    if (!user)
      throw new AppError(
        HTTP_CODE.INTERNAL_SERVER_ERROR,
        `Failed to Add Profile Pictrue`
      );
  }

  if (data) {
    const { name, phone } = data || {};
    user = await User.findByIdAndUpdate(
      user._id,
      {
        name,
        phone,
      },
      { new: true, runValidators: true }
    );

    if (!user)
      throw new AppError(
        HTTP_CODE.INTERNAL_SERVER_ERROR,
        `Failed to Rename Profile!`
      );
  }

  const { password, ...rest } = user.toObject();

  return rest;
};

export const updatePassword = async (
  decodedToken: JwtPayload,
  data?: IUser
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) throw new AppError(404, 'User not found!');

  if (user.role === 'SUPER_ADMIN')
    throw new AppError(
      400,
      'SUPER_ADMIN can not update password from dashboard!'
    );

  const hashPassword = bcryptjs.hashSync(
    data!.password,
    bcryptjs.genSaltSync(ENV.BCRYPT_SALT_ROUND)
  );

  await User.findByIdAndUpdate(user._id, {
    password: hashPassword,
  });
};

export const getAllUsers = async (query: Record<string, string>) => {
  const users = await useQuery(User, query, {
    fields: true,
    filter: true,
    sort: true,
    paginate: true,
    excludes: ['password', 'auths', 'phone'],
    populate: [{ path: 'wallet', select: 'balance -_id' }],
    search: ['email'],
  });
  return users;
};

export const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new AppError(HTTP_CODE.NOT_FOUND, 'User Not Found!');
  }

  return user;
};

export const getMyProfile = async (decodedToken: JwtPayload) => {
  const user = await User.findById(decodedToken.userId).select('-password');

  if (!user) {
    throw new AppError(HTTP_CODE.NOT_FOUND, 'User Not Found!');
  }

  return user;
};

export const requestForAgent = async (decodedToken: JwtPayload) => {
  const { userId, email } = decodedToken;

  const user = await User.findById(userId);

  if (!user) throw new AppError(404, 'User not found!');

  if (user.role !== Role.USER)
    throw new AppError(HTTP_CODE.BAD_REQUEST, `You are already an agent!`);

  let toAgent = await ToAgent.findOne({ user: user._id });

  if (!toAgent) {
    toAgent = await ToAgent.create({
      status: IToAgentStatus.PENDING,
      user: user._id,
    });
  } else {
    toAgent = await ToAgent.findByIdAndUpdate(
      toAgent._id,
      { status: IToAgentStatus.PENDING },
      { new: true }
    );
  }

  if (!toAgent)
    throw new AppError(
      HTTP_CODE.INTERNAL_SERVER_ERROR,
      `Failed to request for agent.`
    );

  const info = await sendMail({
    subject: 'Request for Agent in Neela Wallet API',
    to: email,
    template: {
      name: 'request-for-agent',
      data: {
        name: user.name,
        status: toAgent.status,
      },
    },
  });

  if (!info.accepted.includes(email))
    throw new AppError(
      HTTP_CODE.INTERNAL_SERVER_ERROR,
      `Failed to send email.`
    );
};
