"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const isProd = process.env.NODE_ENV === 'production';
const setAuthCookie = (res, tokens) => {
    if (tokens.accessToken) {
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 86400000,
        });
    }
    if (tokens.refreshToken) {
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 604800000,
        });
    }
};
exports.setAuthCookie = setAuthCookie;
