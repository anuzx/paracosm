import Elysia, { status } from "elysia";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  { as: "scoped" },
  ({ request, set }) => {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      set.status = 401;
      throw status(401, "Unauthorized");
    }

    const decoded = jwt.verify(token, "secret") as JwtPayload;

    return {
      user: {
        id: decoded.id as string,
        role: decoded.role as "admin" | "user",
      },
    };
  },
);
