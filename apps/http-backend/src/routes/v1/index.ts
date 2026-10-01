import { SigninSchema, SignupSchema } from "@repo/common";
import { Elysia } from "elysia";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import adminRouter from "./admin.route";
import spaceRouter from "./space.route";
import userRouter from "./user.route";
import bcrypt from "bcrypt";
import { avatars, db, elements, users } from "@repo/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../middlewares/auth.middleware";

const authRouter = new Elysia({ prefix: "/auth" })
  .post("/signup", async ({ body, set }) => {
    const { success, data } = SignupSchema.safeParse(body);

    if (!success) {
      set.status = 400;
      return ApiError("Invalid request");
    }

    const { username, password, role } = data;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      set.status = 400;
      return ApiError("username already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
      });

    set.status = 201;
    return ApiResponse(user);
  })
  .post("/signin", async ({ body, set }) => {
    const { success, data } = SigninSchema.safeParse(body);

    if (!success) {
      set.status = 400;
      return ApiError("Invalid request");
    }

    const { username, password } = data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      set.status = 401;
      return ApiError("Invalid username or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      set.status = 401;
      return ApiError("Invalid username or password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      "secret",
    );

    return ApiResponse({ token });
  });

const avatarRouter = new Elysia()
  .use(authMiddleware)
  .get("/avatars", async () => {
    const [avatar] = await db.select().from(avatars);

    return ApiResponse({ avatars: avatar });
  });

const elementRouter = new Elysia()
  .use(authMiddleware)
  .get("/elements", async () => {
    const element = await db.select().from(elements);

    return ApiResponse({ element });
  });

export const router = new Elysia({ prefix: "/api/v1" })
  .use(authRouter)
  .use(avatarRouter)
  .use(elementRouter)
  .use(new Elysia({ prefix: "/user" }).use(userRouter))
  .use(new Elysia({ prefix: "/space" }).use(spaceRouter))
  .use(new Elysia({ prefix: "/admin" }).use(adminRouter));
