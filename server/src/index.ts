import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { postResolver } from "./resolvers/postResolver";
import { userResolver } from "./resolvers/userResolver";
import cookieParser from "cookie-parser";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { updootLoader } from "./utils/updootLoader";

export const dataSource = new DataSource({
  type: "postgres",
  database: "reddit2",
  username: "postgres",
  password: "zayarwin7751",
  logging: true,
  synchronize: true,
  entities: [User, Post, Updoot],
  migrations: [
    path.join(__dirname, "./migrations/*"),
  ],
});

const main = async () => {
  // const post = orm.em.fork().create(Post,{title : "This is first post"})
  // await orm.em.persistAndFlush(post);

  await dataSource.initialize().then(() => {
    console.log("database is connected.");
  });
  // await Post.delete({})
  // await dataSource.runMigrations()
  const schema = await buildSchema({
    resolvers: [postResolver, userResolver],
    validate: false,
  });
  // const posts = await orm.em.find(Post,{})
  // console.log(posts);

  const app = express();
  app.use(cookieParser());

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      updootLoader: updootLoader(),
    }),
  });
  const port = process.env.PORT || 4000;

  await apolloServer.start();
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
    console.log(
      `Server is running on http://localhost:4000/graphql`
    );
  });
};

main().catch((err) => {
  console.log(err);
});
