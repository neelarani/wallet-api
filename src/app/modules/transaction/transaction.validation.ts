import z from "zod";

export const zTopUpMoneySchema = z.object({
  amount: z.number().refine((val) => val !== 0, {
    message: "amount is positive integer",
  }),
});

export const zWithdrawSchema = z.object({
  amount: z.number().refine((val) => val !== 0, {
    message: "amount is positive integer",
  }),
});

export const zSendMoneySchema = z.object({
  receiverPhone: z
    .string()
    .regex(
      /^01[0-9]{9}$/,
      "Invalid phone number (must start with 01 and be 11 digits)"
    ),

  amount: z
    .number()
    .refine((val) => val !== 0, {
      message: "name is positive integer",
    })
    .min(1, "Amount must be at least 1"),
});

export const zCashInSchema = z.object({
  receiverPhone: z
    .string()
    .regex(
      /^01[0-9]{9}$/,
      "Invalid phone number (must start with 01 and be 11 digits)"
    ),
  amount: z
    .number()
    .refine((val) => val !== 0, {
      message: "name is positive integer",
    })
    .min(1, "Amount must be at least 1"),
});

export const zCashOutSchema = z.object({
  receiverPhone: z
    .string()
    .regex(
      /^01[0-9]{9}$/,
      "Invalid phone number (must start with 01 and be 11 digits)"
    ),

  amount: z
    .number()
    .refine((val) => val !== 0, {
      message: "name is positive integer",
    })
    .min(1, "Amount must be at least 1"),
});
