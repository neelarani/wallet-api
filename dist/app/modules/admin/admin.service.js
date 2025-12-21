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
exports.updateToAgentStatus = exports.retrieveAllAgentApplication = exports.blockAndUnblockUser = exports.retrieveAllUsers = void 0;
const mongoose_qb_1 = require("mongoose-qb");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const errors_1 = require("../../../app/errors");
const shared_1 = require("../../../shared");
const retrieveAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, mongoose_qb_1.useQuery)(user_model_1.User, query, {
        paginate: true,
        sort: true,
        filter: true,
        fields: true,
        search: ["email", "name", "phone"],
        excludes: ["password", "wallet", "auths"],
    });
});
exports.retrieveAllUsers = retrieveAllUsers;
const blockAndUnblockUser = (userId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new errors_1.AppError(shared_1.HTTP_CODE.NOT_FOUND, `User not found to ${isActive}`);
    if (user_interface_1.Role.SUPER_ADMIN === user.role && isActive === "BLOCKED")
        throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, `${user_interface_1.Role.SUPER_ADMIN} account can not be blocked!`);
    if (userId === user._id || user.role === "ADMIN")
        throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, `You can not perform this operation!`);
    user = yield user_model_1.User.findByIdAndUpdate(userId, { isActive });
    if (!user)
        throw new errors_1.AppError(shared_1.HTTP_CODE.SERVICE_UNAVAILABLE, `Failed to ${isActive} user. Try again later!`);
});
exports.blockAndUnblockUser = blockAndUnblockUser;
const retrieveAllAgentApplication = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const toAgent = yield (0, mongoose_qb_1.useQuery)(user_model_1.ToAgent, query, {
        paginate: true,
        fields: true,
        sort: true,
        filter: true,
        search: ["status"],
        populate: [{ path: "user", select: "name email phone role createdAt" }],
    });
    return toAgent;
});
exports.retrieveAllAgentApplication = retrieveAllAgentApplication;
exports.updateToAgentStatus = (0, shared_1.rollback)((session, requestAgentId, status) => __awaiter(void 0, void 0, void 0, function* () {
    let toAgent = yield user_model_1.ToAgent.findById(requestAgentId).session(session);
    if (!toAgent)
        throw new errors_1.AppError(404, "Agent request was not found!");
    const user = yield user_model_1.User.findById(toAgent.user).session(session);
    if (!user)
        throw new errors_1.AppError(404, "User not found for this agent request!");
    if (toAgent.status === user_interface_1.IToAgentStatus.APPROVED)
        throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, `The agent request is already ${user_interface_1.IToAgentStatus.APPROVED}!`);
    toAgent = yield user_model_1.ToAgent.findByIdAndUpdate(requestAgentId, { status, user: user._id }, { new: true, runValidators: true, session }).populate({ path: "user", select: "name email phone" });
    if (toAgent.status === user_interface_1.IToAgentStatus.APPROVED) {
        user.role = user_interface_1.Role.AGENT;
        yield user.save({ session });
    }
    const info = yield (0, shared_1.sendMail)({
        subject: "Request for Agent in Neela Wallet API",
        to: user.email,
        template: {
            name: "update-to-agent-status",
            data: {
                name: user.name,
                status: toAgent.status,
            },
        },
    });
    if (!info.accepted.includes(user.email))
        throw new errors_1.AppError(shared_1.HTTP_CODE.INTERNAL_SERVER_ERROR, `Failed to send email.`);
    return toAgent;
}));
