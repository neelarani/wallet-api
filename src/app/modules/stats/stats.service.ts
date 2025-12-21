import { AppError } from "@/app/errors";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { HTTP_CODE } from "@/shared";
import { Types } from "mongoose";

export const adminOverView = async () => {
  const usersCount = await User.countDocuments();

  const transactionStats = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        volume: { $sum: "$amount" },
      },
    },
  ]);

  return {
    usersCount,
    txrnCount: transactionStats[0]?.totalTransactions || 0,
    txrnVolume: transactionStats[0]?.volume || 0,
  };
};

export const userOverview = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) throw new AppError(HTTP_CODE.NOT_FOUND, `Wallet not found!`);

  return await Transaction.aggregate([
    {
      $match: {
        $or: [
          { sender: new Types.ObjectId(userId) },
          { receiver: new Types.ObjectId(userId) },
        ],
      },
    },
    {
      $group: {
        _id: "amount",
        total: { $sum: 1 },
        volume: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]).then(($) => ({ ...($[0] || {}), balance: wallet.balance }));
};

export const agentOverview = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) throw new AppError(HTTP_CODE.NOT_FOUND, `Wallet not found!`);

  return await Transaction.aggregate([
    {
      $match: {
        $or: [
          { sender: new Types.ObjectId(userId) },
          { receiver: new Types.ObjectId(userId) },
        ],
      },
    },
    {
      $group: {
        _id: "amount",
        total: { $sum: 1 },
        volume: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]).then(($) => ({ ...($[0] || {}), balance: wallet.balance }));
};
