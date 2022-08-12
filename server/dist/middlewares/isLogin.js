"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLogin = void 0;
const isLogin = ({ context }, next) => {
    const userId = context.req.cookies.userId;
    if (!userId) {
        throw new Error("Not authenticated.");
    }
    return next();
};
exports.isLogin = isLogin;
