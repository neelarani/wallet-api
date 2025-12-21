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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestForAgent = exports.getMyProfile = exports.getSingleUser = exports.getAllUsers = exports.updatePassword = exports.editProfile = exports.registerUser = void 0;
const errors_1 = require("../../../app/errors");
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../../../config");
const mongoose_qb_1 = require("mongoose-qb");
const wallet_model_1 = require("../wallet/wallet.model");
const shared_1 = require("../../../shared");
const registerUser = (Payload) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = Payload || {}, { email, password, phone } = _a, rest = __rest(_a, ["email", "password", "phone"]);
    const existingUser = yield user_model_1.User.findOne({
        $or: [{ email }, { phone }],
    });
    if (existingUser) {
        if (existingUser.email === email) {
            throw new errors_1.AppError(400, "User already exists with the same email!");
        }
        if (existingUser.phone === phone) {
            throw new errors_1.AppError(400, "User already exists with the same phone!");
        }
    }
    const authProvider = {
        provider: "credentials",
        providerId: email,
    };
    const hashPassword = bcryptjs_1.default.hashSync(password, bcryptjs_1.default.genSaltSync(config_1.ENV.BCRYPT_SALT_ROUND));
    let user = yield user_model_1.User.create(Object.assign(Object.assign({ email,
        phone }, rest), { auths: [authProvider], password: hashPassword }));
    const wallet = yield wallet_model_1.Wallet.create({
        balance: config_1.ENV.WALLET_INITIAL_BALANCE,
        user: user._id,
    });
    return yield user_model_1.User.findByIdAndUpdate(user._id, { wallet: wallet._id }, { new: true });
});
exports.registerUser = registerUser;
const editProfile = (decodedToken, file, data) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield user_model_1.User.findById(decodedToken.userId);
    if (!user)
        throw new errors_1.AppError(shared_1.HTTP_CODE.NOT_FOUND, `User not found`);
    if (data === null || data === void 0 ? void 0 : data.phone) {
        const userByPhone = yield user_model_1.User.findOne({ phone: data.phone });
        if (userByPhone && (userByPhone === null || userByPhone === void 0 ? void 0 : userByPhone._id.toString()) !== user._id.toString()) {
            throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, `This phone number has been used already in another account!`);
        }
    }
    if (file) {
        const upload = yield (0, shared_1.uploadToCloudinary)(file);
        user = yield user_model_1.User.findByIdAndUpdate(user._id, {
            picture: upload.secure_url,
        }, { new: true, runValidators: true });
        if (!user)
            throw new errors_1.AppError(shared_1.HTTP_CODE.INTERNAL_SERVER_ERROR, `Failed to Add Profile Pictrue`);
    }
    if (data) {
        const { name, phone } = data || {};
        user = yield user_model_1.User.findByIdAndUpdate(user._id, {
            name,
            phone,
        }, { new: true, runValidators: true });
        if (!user)
            throw new errors_1.AppError(shared_1.HTTP_CODE.INTERNAL_SERVER_ERROR, `Failed to Rename Profile!`);
    }
    const _a = user.toObject(), { password } = _a, rest = __rest(_a, ["password"]);
    return rest;
});
exports.editProfile = editProfile;
const updatePassword = (decodedToken, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    if (!user)
        throw new errors_1.AppError(404, "User not found!");
    if (user.role === "SUPER_ADMIN")
        throw new errors_1.AppError(400, "SUPER_ADMIN can not update password from dashboard!");
    const hashPassword = bcryptjs_1.default.hashSync(data.password, bcryptjs_1.default.genSaltSync(config_1.ENV.BCRYPT_SALT_ROUND));
    yield user_model_1.User.findByIdAndUpdate(user._id, {
        password: hashPassword,
    });
});
exports.updatePassword = updatePassword;
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, mongoose_qb_1.useQuery)(user_model_1.User, query, {
        fields: true,
        filter: true,
        sort: true,
        paginate: true,
        excludes: ["password", "auths", "phone"],
        populate: [{ path: "wallet", select: "balance -_id" }],
        search: ["email"],
    });
    return users;
});
exports.getAllUsers = getAllUsers;
const getSingleUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    if (!user) {
        throw new errors_1.AppError(shared_1.HTTP_CODE.NOT_FOUND, "User Not Found!");
    }
    return user;
});
exports.getSingleUser = getSingleUser;
const getMyProfile = (decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId).select("-password");
    if (!user) {
        throw new errors_1.AppError(shared_1.HTTP_CODE.NOT_FOUND, "User Not Found!");
    }
    return user;
});
exports.getMyProfile = getMyProfile;
const requestForAgent = (decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, email } = decodedToken;
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new errors_1.AppError(404, "User not found!");
    if (user.role !== user_interface_1.Role.USER)
        throw new errors_1.AppError(shared_1.HTTP_CODE.BAD_REQUEST, `You are already an agent!`);
    let toAgent = yield user_model_1.ToAgent.findOne({ user: user._id });
    if (!toAgent) {
        toAgent = yield user_model_1.ToAgent.create({
            status: user_interface_1.IToAgentStatus.PENDING,
            user: user._id,
        });
    }
    else {
        toAgent = yield user_model_1.ToAgent.findByIdAndUpdate(toAgent._id, { status: user_interface_1.IToAgentStatus.PENDING }, { new: true });
    }
    if (!toAgent)
        throw new errors_1.AppError(shared_1.HTTP_CODE.INTERNAL_SERVER_ERROR, `Failed to request for agent.`);
    const info = yield (0, shared_1.sendMail)({
        subject: "Request for Agent in Neela Wallet API",
        to: email,
        template: {
            name: "request-for-agent",
            data: {
                name: user.name,
                status: toAgent.status,
            },
        },
    });
    if (!info.accepted.includes(email))
        throw new errors_1.AppError(shared_1.HTTP_CODE.INTERNAL_SERVER_ERROR, `Failed to send email.`);
});
exports.requestForAgent = requestForAgent;
