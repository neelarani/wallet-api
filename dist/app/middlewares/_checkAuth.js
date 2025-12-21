"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const errors_1 = require("../../app/errors");
const shared_1 = require("../../shared");
const config_1 = require("../../config");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (...authRoles) => (0, shared_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.headers.authorization || req.cookies.accessToken;
    console.log(accessToken, 'token');
    if (!accessToken)
        throw new errors_1.AppError(403, 'No Token Received!');
    const verifiedToken = (0, shared_1.verifyToken)(accessToken, config_1.ENV.JWT_ACCESS_SECRET);
    const user = yield user_model_1.User.findOne({ email: verifiedToken.email });
    if (!user)
        throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, 'User does not Exist');
    if (user.isActive === user_interface_1.IsActive.BLOCKED ||
        user.isActive === user_interface_1.IsActive.INACTIVE)
        throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, `User is ${user.isActive}`);
    if (user.isDeleted)
        throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, 'User is deleted');
    if (!authRoles.includes(verifiedToken.role))
        throw new errors_1.AppError(403, 'You are not permitted to view this route');
    req.user = verifiedToken;
    next();
}));
exports.checkAuth = checkAuth;
