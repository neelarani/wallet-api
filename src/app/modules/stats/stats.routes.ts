import { Router } from "express";
import { Role } from "../user/user.interface";
import { checkAuth } from "@/app/middlewares";
import * as controller from "./stats.controller";

const router = Router();

router.get(
  "/admin-overview",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  controller.adminOverView
);

router.get("/user-overview", checkAuth(Role.USER), controller.userOverView);

router.get("/agent-overview", checkAuth(Role.AGENT), controller.agentOverView);

export default router;
