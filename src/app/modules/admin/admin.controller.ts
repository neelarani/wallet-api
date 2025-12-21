import { catchAsync, HTTP_CODE, sendResponse } from "@/shared";
import * as service from "./admin.service";

export const retrieveAllUsers = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "Retrieve all users successfully!",
    ...(await service.retrieveAllUsers(req.query as Record<string, string>)),
  });
});

export const blockAndUnblockUser = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: `User ${req.body.isActive} has been successfully!`,
    data: await service.blockAndUnblockUser(req.body.userId, req.body.isActive),
  });
});

export const retrieveAllAgentApplication = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "All Agent Application has been",
    ...(await service.retrieveAllAgentApplication(
      req.query as Record<string, string>
    )),
  });
});

export const updateToAgentStatus = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "Request for agent has been " + req.body.status,
    data: await service.updateToAgentStatus(
      req.body.requestAgentId,
      req.body.status
    ),
  });
});
