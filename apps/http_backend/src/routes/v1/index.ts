import { Elysia } from "elysia";
import userRouter from "./user.route";
import spaceRouter from "./space.route";
import adminRouter from "./admin.route";

export const router = new Elysia()
  .use(new Elysia({ prefix: "/user" }).use(userRouter))
  .use(new Elysia({ prefix: "/space" }).use(spaceRouter))
  .use(new Elysia({ prefix: "/admin" }).use(adminRouter));
