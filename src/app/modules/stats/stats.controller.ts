import { catchAsync, HTTP_CODE, sendResponse } from "@/shared";
import * as service from "./stats.service";
import { JwtPayload } from "jsonwebtoken";

export const adminOverView = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "Retrieve admin overview successfully!",
    data: await service.adminOverView(),
  });
});

export const userOverView = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "Retrieve user overview successfully!",
    data: await service.userOverview((req.user as JwtPayload).userId),
  });
});

export const agentOverView = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "Retrieve agent overview successfully!",
    data: await service.agentOverview((req.user as JwtPayload).userId),
  });
});
