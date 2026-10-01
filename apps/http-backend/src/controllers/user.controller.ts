import { UpdateMetadataSchema } from "@repo/common";
import { ApiError } from "../utils/apiError";
import { avatars, db, users } from "@repo/db";
import { eq, inArray } from "drizzle-orm";
import type { Context } from "elysia";
import { AuthedContext } from "../types";

const updateMetadata = async ({ body, set, user }: AuthedContext) => {
  const { success, data } = UpdateMetadataSchema.safeParse(body);

  const userId = user.id;

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { avatarId } = data;

  await db.update(users).set({ avatarId }).where(eq(users.id, userId));

  return { success: true };
};

const usersMetadata = async ({ query }: Context) => {
  // /api/v1/metadata/bulk?ids=[1,2,3,4]
  const userIds = (query.ids ?? "[]")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (userIds.length === 0) return { avatars: [] };

  const metadata = await db
    .select({ id: users.id, imageUrl: avatars.imageUrl })
    .from(users)
    .leftJoin(avatars, eq(users.avatarId, avatars.id))
    .where(inArray(users.id, userIds));

  return {
    avatars: metadata.map((m) => ({
      userId: m.id,
      avatarId: m.imageUrl,
    })),
  };
};

export { updateMetadata, usersMetadata };
