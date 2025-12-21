"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../../app/middlewares");
const controller = __importStar(require("./user.controller"));
const validator = __importStar(require("./user.validation"));
const user_interface_1 = require("./user.interface");
const router = (0, express_1.Router)();
router.post("/register", (0, middlewares_1.validateRequest)(validator.zCreateUserSchema), controller.registerUser);
router.patch("/edit", (0, middlewares_1.checkAuth)(...Object.values(user_interface_1.Role)), middlewares_1.multerUpload.single("file"), (0, middlewares_1.validateRequest)(validator.zUpdateUserSchema), controller.editProfile);
router.patch("/update-password", (0, middlewares_1.checkAuth)(...Object.values(user_interface_1.Role)), (0, middlewares_1.validateRequest)(validator.zUpdatePasswordSchema), controller.updatePassword);
router.get("/get-all-users", (0, middlewares_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.ADMIN), controller.getAllUsers);
router.get("/me", (0, middlewares_1.checkAuth)(...Object.values(user_interface_1.Role)), controller.getMyProfile);
router.get("/:id", (0, middlewares_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), controller.getSingleUser);
router.post("/request-for-agent", (0, middlewares_1.checkAuth)(user_interface_1.Role.USER), controller.requestForAgent);
exports.default = router;
