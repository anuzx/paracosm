import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "@repo/common";
import { AuthedContext } from "../types";
import { ApiError } from "../utils/apiError";
import { avatars, db, elements, mapElements, maps } from "@repo/db";
import { ApiResponse } from "../utils/apiResponse";
import { eq } from "drizzle-orm";

const createElement = async ({ body, set }: AuthedContext) => {
  const { success, data } = CreateElementSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { imageUrl, width, height, static: isStatic } = data;

  const [element] = await db
    .insert(elements)
    .values({
      width,
      height,
      imageUrl,
      static: isStatic,
    })
    .returning({
      id: elements.id,
    });

  return ApiResponse({ id: element.id });
};

const updateElement = async ({ body, set, params }: AuthedContext) => {
  const { success, data } = UpdateElementSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { imageUrl } = data;
  const elementId = params.elementId;

  await db.update(elements).set({ imageUrl }).where(eq(elements.id, elementId));

  return { message: "element updated" };
};

const createAvatar = async ({ body, set }: AuthedContext) => {
  const { success, data } = CreateAvatarSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { imageUrl, name } = data;

  const [avatar] = await db
    .insert(avatars)
    .values({
      imageUrl,
      name,
    })
    .returning({
      id: avatars.id,
    });

  return ApiResponse({ avatarId: avatar.id });
};

const createMap = async ({ body, set }: AuthedContext) => {
  const { success, data } = CreateMapSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { thumbnail, dimensions, name, defaultElements } = data;

  const width = Number(dimensions.split("x")[0]);
  const height = Number(dimensions.split("x")[1]);

  const result = await db.transaction(async (tx) => {
    const [createdMap] = await tx
      .insert(maps)
      .values({ name, width, height, thumbnail })
      .returning();

    // inserting an empty array throws in drizzle
    const createdElements =
      defaultElements.length > 0
        ? await tx
            .insert(mapElements)
            .values(
              defaultElements.map((e) => ({
                mapId: createdMap.id,
                elementId: e.elementId,
                x: e.x,
                y: e.y,
              })),
            )
            .returning({
              elementId: mapElements.elementId,
              x: mapElements.x,
              y: mapElements.y,
            })
        : [];

    return { createdMap, createdElements };
  });

  return {
    thumbnail: result.createdMap.thumbnail,
    dimensions: `${result.createdMap.width}x${result.createdMap.height}`,
    name: result.createdMap.name,
    defaultElements: result.createdElements,
  };
};

export { createElement, updateElement, createAvatar, createMap };
