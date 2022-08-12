import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/context";

export const isLogin:MiddlewareFn<Context> = ({context},next) => {
    const userId = context.req.cookies.userId;
    if(!userId){
        throw new Error("Not authenticated.")
    }
    return next()
}