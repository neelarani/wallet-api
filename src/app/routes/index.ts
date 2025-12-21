import { Router } from "express";
import * as modules from "@/app/modules";

const moduleRoutes: Array<{ path: string; route: Router }> = [
  {
    path: "/user",
    route: modules.UserRoutes,
  },
  {
    path: "/auth",
    route: modules.AuthRoutes,
  },
  {
    path: "/transaction",
    route: modules.TransactionRoutes,
  },
  {
    path: "/wallet",
    route: modules.WalletRoutes,
  },
  {
    path: "/admin",
    route: modules.AdminRoutes,
  },
  {
    path: "/stats",
    route: modules.StatsRoutes,
  },
];

export default moduleRoutes.reduce(
  (router, module) => router.use(module.path, module.route),
  Router()
);
