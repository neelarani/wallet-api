import { checkAuth, validateRequest } from "@/app/middlewares";
import { Role } from "../user/user.interface";
import { Router } from "express";
import * as controller from "./admin.controller";
import * as validator from "./admin.validation";

const router = Router();
router.use(checkAuth(Role.ADMIN, Role.SUPER_ADMIN));

router.get("/all-users", controller.retrieveAllUsers);
router.patch(
  "/block-unblock",
  validateRequest(validator.zBlockAndUnblockUserSchema),
  controller.blockAndUnblockUser
);
router.get("/retrieve-all-application", controller.retrieveAllAgentApplication);
router.patch(
  "/update-to-agent-status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(validator.zUpdateToAgentSchema),
  controller.updateToAgentStatus
);

export default router;
