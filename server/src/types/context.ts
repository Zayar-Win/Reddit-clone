import { Request, Response } from "express";
import { updootLoader } from "../utils/updootLoader";

export interface Context {
  req: Request;
  res: Response;
  updootLoader: ReturnType<typeof updootLoader>;
}
