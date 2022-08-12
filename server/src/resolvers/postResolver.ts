import { tmpdir } from "os";
import {
  Arg,
  Args,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { dataSource } from "..";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { isLogin } from "../middlewares/isLogin";
import { Context } from "../types/context";
import { updootLoader } from "../utils/updootLoader";

@InputType()
class InputDataType {
  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  id?: number;

  @Field(() => String)
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@InputType()
class VoteInputType {
  @Field()
  postId: number;

  @Field()
  value: number;
}

@Resolver(Post)
export class postResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, updootLoader }: Context
  ) {
    const userId = req.cookies.userId;

    if (!userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      userId,
      postId: post.id,
    });
    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isLogin)
  async vote(
    @Arg("voteInput") voteInput: VoteInputType,
    @Ctx() { req }: Context
  ) {
    const userId = req.cookies.userId;
    const isUpdoot = voteInput.value !== -1;
    const realValue = isUpdoot ? 1 : -1;

    const updoot = await Updoot.findOne({
      where: { userId, postId: voteInput.postId },
    });

    if (updoot && updoot.value !== realValue) {
      await dataSource.transaction(async (tm) => {
        await tm.query(
          `
                      update updoot
                      set value = $1
                      where "postId" = $2 and "userId" = $3
                  `,
          [realValue, voteInput.postId, userId]
        );

        await tm.query(
          `
                       update post set points = points + $1
                       where id = $2
                   `,
          [2 * realValue, voteInput.postId]
        );
      });
    } else if (!updoot) {
      console.log("i am new voter");
      await dataSource.transaction(async (tm) => {
        await tm.query(
          `
            insert into updoot ("postId","userId","value")
            values ($1,$2,$3)
          `,
          [
            voteInput.postId,
            userId,
            voteInput.value,
          ]
        );

        await tm.query(
          `
            update post set points = points + $1
            where id = $2
          `,
          [voteInput.value, voteInput.postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, {
      nullable: true,
    })
    cursor: string | null,
    @Ctx() { req }: Context
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const qb = dataSource
      .getRepository(Post)
      .createQueryBuilder("p")
      .innerJoinAndSelect(
        "p.creator",
        "u",
        'u.id = p."creatorId"'
      )
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
    const posts = await qb.getMany();
    return {
      posts: posts.slice(0, posts.length - 1),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg("id") id: number
  ): Promise<Post | null> {
    const post = await Post.findOne({
      where: { id },
    });
    return post;
  }

  @Mutation(() => Post)
  @UseMiddleware(isLogin)
  async createPost(
    @Arg("inputData") inputData: InputDataType,
    @Ctx() { req }: Context
  ): Promise<Post | null> {
    const id = req.cookies.userId;
    const post = await Post.create({
      ...inputData,
      creatorId: id,
    }).save();
    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("inputData") inputData: InputDataType
  ): Promise<Post | null> {
    const { title, id } = inputData;
    const post = await Post.findOne({
      where: { id },
    });
    if (!post) {
      return null;
    }
    if (
      typeof title !== undefined ||
      title.length > 0
    ) {
      post.title = title;
      await post.save();
      return post;
    }

    return post;
  }

  @Mutation(() => Post)
  async deletePost(@Arg("id") id: number) {
    const post = await Post.findOne({
      where: { id },
    });
    if (!post) {
      return false;
    }

    await Post.delete(id);
    return true;
  }
}
