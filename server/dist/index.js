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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const postResolver_1 = require("./resolvers/postResolver");
const userResolver_1 = require("./resolvers/userResolver");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
const path_1 = __importDefault(require("path"));
const Updoot_1 = require("./entities/Updoot");
const updootLoader_1 = require("./utils/updootLoader");
exports.dataSource = new typeorm_1.DataSource({
    type: "postgres",
    database: "reddit2",
    username: "postgres",
    password: "zayarwin7751",
    logging: true,
    synchronize: true,
    entities: [User_1.User, Post_1.Post, Updoot_1.Updoot],
    migrations: [
        path_1.default.join(__dirname, "./migrations/*"),
    ],
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    // const post = orm.em.fork().create(Post,{title : "This is first post"})
    // await orm.em.persistAndFlush(post);
    yield exports.dataSource.initialize().then(() => {
        console.log("database is connected.");
    });
    // await Post.delete({})
    // await dataSource.runMigrations()
    const schema = yield (0, type_graphql_1.buildSchema)({
        resolvers: [postResolver_1.postResolver, userResolver_1.userResolver],
        validate: false,
    });
    // const posts = await orm.em.find(Post,{})
    // console.log(posts);
    const app = (0, express_1.default)();
    app.use((0, cookie_parser_1.default)());
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        context: ({ req, res }) => ({
            req,
            res,
            updootLoader: (0, updootLoader_1.updootLoader)(),
        }),
    });
    const port = process.env.PORT || 4000;
    yield apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: {
            credentials: true,
            origin: [
                "http://localhost:3000",
                "https://studio.apollographql.com",
            ],
        },
    });
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:4000/graphql`);
    });
});
main().catch((err) => {
    console.log(err);
});
