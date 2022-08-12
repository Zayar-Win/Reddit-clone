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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolver = void 0;
const type_graphql_1 = require("type-graphql");
const __1 = require("..");
const Post_1 = require("../entities/Post");
const Updoot_1 = require("../entities/Updoot");
const isLogin_1 = require("../middlewares/isLogin");
let InputDataType = class InputDataType {
};
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], InputDataType.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Number)
], InputDataType.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], InputDataType.prototype, "text", void 0);
InputDataType = __decorate([
    (0, type_graphql_1.InputType)()
], InputDataType);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let VoteInputType = class VoteInputType {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], VoteInputType.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], VoteInputType.prototype, "value", void 0);
VoteInputType = __decorate([
    (0, type_graphql_1.InputType)()
], VoteInputType);
let postResolver = class postResolver {
    textSnippet(post) {
        return post.text.slice(0, 50);
    }
    voteStatus(post, { req, updootLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.cookies.userId;
            if (!userId) {
                return null;
            }
            const updoot = yield updootLoader.load({
                userId,
                postId: post.id,
            });
            return updoot ? updoot.value : null;
        });
    }
    vote(voteInput, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.cookies.userId;
            const isUpdoot = voteInput.value !== -1;
            const realValue = isUpdoot ? 1 : -1;
            const updoot = yield Updoot_1.Updoot.findOne({
                where: { userId, postId: voteInput.postId },
            });
            if (updoot && updoot.value !== realValue) {
                yield __1.dataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`
                      update updoot
                      set value = $1
                      where "postId" = $2 and "userId" = $3
                  `, [realValue, voteInput.postId, userId]);
                    yield tm.query(`
                       update post set points = points + $1
                       where id = $2
                   `, [2 * realValue, voteInput.postId]);
                }));
            }
            else if (!updoot) {
                console.log("i am new voter");
                yield __1.dataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`
            insert into updoot ("postId","userId","value")
            values ($1,$2,$3)
          `, [
                        voteInput.postId,
                        userId,
                        voteInput.value,
                    ]);
                    yield tm.query(`
            update post set points = points + $1
            where id = $2
          `, [voteInput.value, voteInput.postId]);
                }));
            }
            return true;
        });
    }
    posts(limit, cursor, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const qb = __1.dataSource
                .getRepository(Post_1.Post)
                .createQueryBuilder("p")
                .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
                .orderBy('p."createdAt"', "DESC")
                .limit(realLimitPlusOne);
            //    const posts =  await dataSource.manager
            //     .createQueryBuilder()
            //     .select('post')
            //     .from(Post, 'post')
            //     .leftJoinAndSelect('post.creator', 'user')
            //     .orderBy('post."createdAt"', 'DESC')
            //     .limit(realLimitPlusOne)
            //     .getMany();
            if (cursor) {
                qb.where('p."createdAt" < :cursor', {
                    cursor: new Date(cursor),
                });
            }
            const posts = yield qb.getMany();
            return {
                posts: posts.slice(0, posts.length - 1),
                hasMore: posts.length === realLimitPlusOne,
            };
        });
    }
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.findOne({
                where: { id },
            });
            return post;
        });
    }
    createPost(inputData, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.cookies.userId;
            const post = yield Post_1.Post.create(Object.assign(Object.assign({}, inputData), { creatorId: id })).save();
            return post;
        });
    }
    updatePost(inputData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, id } = inputData;
            const post = yield Post_1.Post.findOne({
                where: { id },
            });
            if (!post) {
                return null;
            }
            if (typeof title !== undefined ||
                title.length > 0) {
                post.title = title;
                yield post.save();
                return post;
            }
            return post;
        });
    }
    deletePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.findOne({
                where: { id },
            });
            if (!post) {
                return false;
            }
            yield Post_1.Post.delete(id);
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], postResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], postResolver.prototype, "voteStatus", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isLogin_1.isLogin),
    __param(0, (0, type_graphql_1.Arg)("voteInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VoteInputType, Object]),
    __metadata("design:returntype", Promise)
], postResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, {
        nullable: true,
    })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], postResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], postResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isLogin_1.isLogin),
    __param(0, (0, type_graphql_1.Arg)("inputData")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InputDataType, Object]),
    __metadata("design:returntype", Promise)
], postResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    __param(0, (0, type_graphql_1.Arg)("inputData")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InputDataType]),
    __metadata("design:returntype", Promise)
], postResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], postResolver.prototype, "deletePost", null);
postResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], postResolver);
exports.postResolver = postResolver;
