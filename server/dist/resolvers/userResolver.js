"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const sendMail_1 = require("../utils/sendMail");
const __1 = require("..");
let UserDataInputType = class UserDataInputType {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserDataInputType.prototype, "firstName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserDataInputType.prototype, "lastName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserDataInputType.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserDataInputType.prototype, "password", void 0);
UserDataInputType = __decorate([
    (0, type_graphql_1.InputType)()
], UserDataInputType);
let UserLoginInputData = class UserLoginInputData {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserLoginInputData.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserLoginInputData.prototype, "password", void 0);
UserLoginInputData = __decorate([
    (0, type_graphql_1.InputType)()
], UserLoginInputData);
let ChangePasswordInput = class ChangePasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ChangePasswordInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ChangePasswordInput.prototype, "token", void 0);
ChangePasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], ChangePasswordInput);
let ErrorField = class ErrorField {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ErrorField.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ErrorField.prototype, "message", void 0);
ErrorField = __decorate([
    (0, type_graphql_1.ObjectType)()
], ErrorField);
let LoginReturn = class LoginReturn {
};
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], LoginReturn.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ErrorField], { nullable: true }),
    __metadata("design:type", Array)
], LoginReturn.prototype, "errors", void 0);
LoginReturn = __decorate([
    (0, type_graphql_1.ObjectType)()
], LoginReturn);
let ForgetPasswordReturn = class ForgetPasswordReturn {
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ForgetPasswordReturn.prototype, "isSend", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ErrorField], { nullable: true }),
    __metadata("design:type", Array)
], ForgetPasswordReturn.prototype, "errors", void 0);
ForgetPasswordReturn = __decorate([
    (0, type_graphql_1.ObjectType)()
], ForgetPasswordReturn);
let ChangePasswordReturn = class ChangePasswordReturn {
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ChangePasswordReturn.prototype, "isChanged", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ErrorField], { nullable: true }),
    __metadata("design:type", Array)
], ChangePasswordReturn.prototype, "errors", void 0);
ChangePasswordReturn = __decorate([
    (0, type_graphql_1.ObjectType)()
], ChangePasswordReturn);
let userResolver = class userResolver {
    email(user, { req }) {
        const userId = req.cookies.userId;
        if (parseInt(userId) === user.id) {
            return user.email;
        }
        return null;
    }
    register({ firstName, lastName, email, password, }) {
        return __awaiter(this, void 0, void 0, function* () {
            let user;
            try {
                user = yield User_1.User.findOne({
                    where: { email },
                });
            }
            catch (err) {
                user = null;
            }
            const isValidEmail = email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            if (!isValidEmail) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "Email is not valid",
                        },
                    ],
                };
            }
            if (user) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "Email is already taken.",
                        },
                    ],
                };
            }
            const gen = yield bcrypt_1.default.genSalt(10);
            const hashPassword = yield bcrypt_1.default.hash(password, gen);
            const result = yield __1.dataSource
                .createQueryBuilder()
                .insert()
                .into(User_1.User)
                .values({
                firstName,
                lastName,
                email,
                password: hashPassword,
            })
                .returning("*")
                .execute();
            const newUser = result.raw[0];
            return { user: newUser };
        });
    }
    login({ email, password }, { res }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({
                where: { email },
            });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "Email does not exit.",
                        },
                    ],
                };
            }
            const valid = yield bcrypt_1.default.compare(password, user.password);
            if (!valid) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "Password doesn't match.",
                        },
                    ],
                };
            }
            res.cookie("userId", user.id, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            return { user };
        });
    }
    logout({ req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("userId");
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    forgetPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({
                where: { email },
            });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "Email doesn't exist",
                        },
                    ],
                };
            }
            const token = (0, jwt_1.singJwt)({ id: user.id });
            const html = `<a href="http://localhost:3000/changePassword/${token}">Click here to change Password</a>`;
            (0, sendMail_1.sendMail)({
                to: user.email,
                subject: "Change Password",
                html,
            });
            return {
                isSend: true,
            };
        });
    }
    changePassword({ password, token }) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = (0, jwt_1.verifyToken)(token);
            if (!decoded) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "Please try by requesting new Email.",
                        },
                    ],
                };
            }
            const user = yield User_1.User.findOne({
                where: { id: decoded.id },
            });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "user",
                            message: "User doesn't eixst.",
                        },
                    ],
                };
            }
            const salt = yield bcrypt_1.default.genSalt(12);
            const hashPassword = yield bcrypt_1.default.hash(password, salt);
            user.password = hashPassword;
            user.save();
            return {
                isChanged: true,
            };
        });
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const cookie = req.cookies.userId;
            if (!cookie) {
                return null;
            }
            const user = yield User_1.User.findOne({
                where: { id: cookie },
            });
            if (!user) {
                return null;
            }
            return user;
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], userResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => LoginReturn),
    __param(0, (0, type_graphql_1.Arg)("userInput")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserDataInputType]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => LoginReturn),
    __param(0, (0, type_graphql_1.Arg)("loginInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserLoginInputData, Object]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => ForgetPasswordReturn),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "forgetPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => ChangePasswordReturn),
    __param(0, (0, type_graphql_1.Arg)("changePasswordInput")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChangePasswordInput]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "me", null);
userResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], userResolver);
exports.userResolver = userResolver;
