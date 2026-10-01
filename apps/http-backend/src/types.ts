import { Context } from "elysia";

export type AuthedContext = Context & {
  user: { id: string; role: string };
};