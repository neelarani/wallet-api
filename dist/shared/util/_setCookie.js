"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const config_1 = require("../../config");
const isProd = process.env.NODE_ENV === 'production';
const setAuthCookie = (res, tokenInfo) => {
    if (tokenInfo.accessToken) {
        res.cookie('accessToken', tokenInfo.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: config_1.ENV.ACCESS_COOKIE_EXPIRE_TIME,
        });
    }
    if (tokenInfo.refreshToken) {
        res.cookie('refreshToken', tokenInfo.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: config_1.ENV.REFRESH_COOKIE_EXPIRE_TIME,
        });
    }
};
exports.setAuthCookie = setAuthCookie;
