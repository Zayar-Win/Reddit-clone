import DataLoader from "dataloader";
import { In } from "typeorm";
import { Updoot } from "../entities/Updoot";

export const updootLoader = () =>
  new DataLoader<
    { postId: number; userId: number },
    Updoot | null
  >(async (keys) => {
    const userIds = keys.map((key) => key.userId);
    const postIds = keys.map((key) => key.postId);
    const updoots = await Updoot.findBy({
      userId: In(userIds),
      postId: In(postIds),
    });
    console.log(updoots);
    const updootIdsToUpdoot: Record<
      string,
      Updoot
    > = {};
    updoots.forEach((updoot) => {
      updootIdsToUpdoot[
        `${updoot.userId}|${updoot.postId}`
      ] = updoot;
    });
    return keys.map(
      (key) =>
        updootIdsToUpdoot[
          `${key.userId}|${key.postId}`
        ]
    );
  });
