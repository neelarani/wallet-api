import z from "zod";
import { IsActive, IToAgentStatus } from "../user/user.interface";
import { isValidObjectId } from "mongoose";

export const zBlockAndUnblockUserSchema = z.object({
  userId: z
    .string({ message: "userId is required" })
    .refine((val) => isValidObjectId(val), {
      message: "Invalid userId format",
    }),
  isActive: z
    .enum(Object.values(IsActive))
    .refine((val) => !Object.values(val).includes(val), {
      message: `Provided role must in ${Object.values(IsActive).join(", ")}`,
    }),
});

export const zUpdateToAgentSchema = z.object({
  requestAgentId: z
    .string("requestAgentId is required")
    .refine((val) => isValidObjectId(val.trim()), {
      message: "requestAgentId must be a valid ObjectId",
    }),
  status: z
    .enum(Object.values(IToAgentStatus))
    .refine((val) => !Object.values(val).includes(val), {
      message: `Provided status must in ${Object.values(IToAgentStatus).join(
        ", "
      )}`,
    }),
});
