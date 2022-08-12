"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.singJwt = exports.jwtSecret = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwtSecret = "this is jwt secret.";
const singJwt = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, exports.jwtSecret, {
        expiresIn: 1000 * 60 * 5,
    });
    return token;
};
exports.singJwt = singJwt;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.jwtSecret);
        return decoded;
    }
    catch (err) {
        console.log(err);
        return null;
    }
};
exports.verifyToken = verifyToken;
