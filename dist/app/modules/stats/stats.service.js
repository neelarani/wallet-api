"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentOverview = exports.userOverview = exports.adminOverView = void 0;
const errors_1 = require("../../../app/errors");
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const shared_1 = require("../../../shared");
const mongoose_1 = require("mongoose");
const adminOverView = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const usersCount = yield user_model_1.User.countDocuments();
    const transactionStats = yield transaction_model_1.Transaction.aggregate([
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
        txrnCount: ((_a = transactionStats[0]) === null || _a === void 0 ? void 0 : _a.totalTransactions) || 0,
        txrnVolume: ((_b = transactionStats[0]) === null || _b === void 0 ? void 0 : _b.volume) || 0,
    };
});
exports.adminOverView = adminOverView;
const userOverview = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!wallet)
        throw new errors_1.AppError(shared_1.HTTP_CODE.NOT_FOUND, `Wallet not found!`);
    return yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [
                    { sender: new mongoose_1.Types.ObjectId(userId) },
                    { receiver: new mongoose_1.Types.ObjectId(userId) },
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
    ]).then(($) => (Object.assign(Object.assign({}, ($[0] || {})), { balance: wallet.balance })));
});
exports.userOverview = userOverview;
const agentOverview = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    if (!wallet)
        throw new errors_1.AppError(shared_1.HTTP_CODE.NOT_FOUND, `Wallet not found!`);
    return yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [
                    { sender: new mongoose_1.Types.ObjectId(userId) },
                    { receiver: new mongoose_1.Types.ObjectId(userId) },
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
    ]).then(($) => (Object.assign(Object.assign({}, ($[0] || {})), { balance: wallet.balance })));
});
exports.agentOverview = agentOverview;
