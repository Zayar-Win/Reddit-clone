import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { User } from "../entities/User";
import { Context } from "../types/context";
import bcrypt from "bcrypt";
import {
  singJwt,
  verifyToken,
} from "../utils/jwt";
import { sendMail } from "../utils/sendMail";
import { dataSource } from "..";
@InputType()
class UserDataInputType {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
class UserLoginInputData {
  @Field()
  email: string;
  @Field()
  password: string;
}

@InputType()
class ChangePasswordInput {
  @Field()
  password!: string;
  @Field()
  token!: string;
}

@ObjectType()
class ErrorField {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class LoginReturn {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@ObjectType()
class ForgetPasswordReturn {
  @Field(() => Boolean, { nullable: true })
  isSend?: Boolean;

  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@ObjectType()
class ChangePasswordReturn {
  @Field(() => Boolean, { nullable: true })
  isChanged?: Boolean;

  @Field(() => [ErrorField], { nullable: true })
  errors?: ErrorField[];
}

@Resolver(User)
export class userResolver {
  @FieldResolver(() => String, { nullable: true })
  email(
    @Root() user: User,
    @Ctx() { req }: Context
  ) {
    const userId = req.cookies.userId;

    if (parseInt(userId) === user.id) {
      return user.email;
    }

    return null;
  }

  @Mutation(() => LoginReturn)
  async register(
    @Arg("userInput")
    {
      firstName,
      lastName,
      email,
      password,
    }: UserDataInputType
  ): Promise<LoginReturn> {
    let user;
    try {
      user = await User.findOne({
        where: { email },
      });
    } catch (err) {
      user = null;
    }

    const isValidEmail = email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
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
    const gen = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(
      password,
      gen
    );

    const result = await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
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
  }

  @Mutation(() => LoginReturn)
  async login(
    @Arg("loginInput")
    { email, password }: UserLoginInputData,
    @Ctx() { res }: Context
  ): Promise<LoginReturn> {
    const user = await User.findOne({
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
    const valid = await bcrypt.compare(
      password,
      user.password
    );

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
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: Context) {
    try {
      res.clearCookie("userId");
      return true;
    } catch (err) {
      return false;
    }
  }

  @Mutation(() => ForgetPasswordReturn)
  async forgetPassword(
    @Arg("email") email: string
  ) {
    const user = await User.findOne({
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

    const token = singJwt({ id: user.id });
    const html = `<a href="http://localhost:3000/changePassword/${token}">Click here to change Password</a>`;
    sendMail({
      to: user.email,
      subject: "Change Password",
      html,
    });

    return {
      isSend: true,
    };
  }

  @Mutation(() => ChangePasswordReturn)
  async changePassword(
    @Arg("changePasswordInput")
    { password, token }: ChangePasswordInput
  ) {
    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        errors: [
          {
            field: "token",
            message:
              "Please try by requesting new Email.",
          },
        ],
      };
    }

    const user = await User.findOne({
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
    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(
      password,
      salt
    );
    user.password = hashPassword;
    user.save();

    return {
      isChanged: true,
    };
  }

  @Query(() => User)
  async me(@Ctx() { req }: Context) {
    const cookie = req.cookies.userId;
    if (!cookie) {
      return null;
    }
    const user = await User.findOne({
      where: { id: cookie },
    });
    if (!user) {
      return null;
    }
    return user;
  }
}
