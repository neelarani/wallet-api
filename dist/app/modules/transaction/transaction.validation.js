"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zCashOutSchema = exports.zCashInSchema = exports.zSendMoneySchema = exports.zWithdrawSchema = exports.zTopUpMoneySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.zTopUpMoneySchema = zod_1.default.object({
    amount: zod_1.default.number().refine((val) => val !== 0, {
        message: "amount is positive integer",
    }),
});
exports.zWithdrawSchema = zod_1.default.object({
    amount: zod_1.default.number().refine((val) => val !== 0, {
        message: "amount is positive integer",
    }),
});
exports.zSendMoneySchema = zod_1.default.object({
    receiverPhone: zod_1.default
        .string()
        .regex(/^01[0-9]{9}$/, "Invalid phone number (must start with 01 and be 11 digits)"),
    amount: zod_1.default
        .number()
        .refine((val) => val !== 0, {
        message: "name is positive integer",
    })
        .min(1, "Amount must be at least 1"),
});
exports.zCashInSchema = zod_1.default.object({
    receiverPhone: zod_1.default
        .string()
        .regex(/^01[0-9]{9}$/, "Invalid phone number (must start with 01 and be 11 digits)"),
    amount: zod_1.default
        .number()
        .refine((val) => val !== 0, {
        message: "name is positive integer",
    })
        .min(1, "Amount must be at least 1"),
});
exports.zCashOutSchema = zod_1.default.object({
    receiverPhone: zod_1.default
        .string()
        .regex(/^01[0-9]{9}$/, "Invalid phone number (must start with 01 and be 11 digits)"),
    amount: zod_1.default
        .number()
        .refine((val) => val !== 0, {
        message: "name is positive integer",
    })
        .min(1, "Amount must be at least 1"),
});
