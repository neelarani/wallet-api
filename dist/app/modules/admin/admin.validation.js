"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zUpdateToAgentSchema = exports.zBlockAndUnblockUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("../user/user.interface");
const mongoose_1 = require("mongoose");
exports.zBlockAndUnblockUserSchema = zod_1.default.object({
    userId: zod_1.default
        .string({ message: "userId is required" })
        .refine((val) => (0, mongoose_1.isValidObjectId)(val), {
        message: "Invalid userId format",
    }),
    isActive: zod_1.default
        .enum(Object.values(user_interface_1.IsActive))
        .refine((val) => !Object.values(val).includes(val), {
        message: `Provided role must in ${Object.values(user_interface_1.IsActive).join(", ")}`,
    }),
});
exports.zUpdateToAgentSchema = zod_1.default.object({
    requestAgentId: zod_1.default
        .string("requestAgentId is required")
        .refine((val) => (0, mongoose_1.isValidObjectId)(val.trim()), {
        message: "requestAgentId must be a valid ObjectId",
    }),
    status: zod_1.default
        .enum(Object.values(user_interface_1.IToAgentStatus))
        .refine((val) => !Object.values(val).includes(val), {
        message: `Provided status must in ${Object.values(user_interface_1.IToAgentStatus).join(", ")}`,
    }),
});
