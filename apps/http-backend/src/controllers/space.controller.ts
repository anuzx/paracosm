import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "@repo/common";
import { Context } from "elysia";
import { ApiError } from "../utils/apiError";
import {
  db,
  elements,
  mapElements,
  maps,
  spaceElements,
  spaces,
} from "@repo/db";
import { ApiResponse } from "../utils/apiResponse";
import { and, eq } from "drizzle-orm";
import { AuthedContext } from "../types";

const createSpace = async ({ body, set, user }: AuthedContext) => {
  const { success, data } = CreateSpaceSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { name, dimensions, mapId } = data;

  const creatorId = user.id;

  const x = Number(dimensions.split("x")[0]);
  const y = Number(dimensions.split("x")[1]);

  if (x <= 0 || y <= 0) {
    return null;
  }

  //blank space
  if (!mapId) {
    const [space] = await db
      .insert(spaces)
      .values({
        name,
        width: x,
        height: y,
        creatorId,
      })
      .returning({
        id: spaces.id,
      });

    set.status = 201;
    return ApiResponse({ spaceId: space.id });
  }

  //space copied from a map
  const [map] = await db.select().from(maps).where(eq(maps.id, mapId)).limit(1);

  if (!map) {
    set.status = 404;
    return ApiError("Map not found");
  }

  const items = await db
    .select()
    .from(mapElements)
    .where(eq(mapElements.mapId, mapId));

  const space = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(spaces)
      .values({
        name,
        width: map.width,
        height: map.height,
        creatorId: user.id,
      })
      .returning({
        id: spaces.id,
      });

    // spaceElements requires elementId, x and y, but mapElements has them nullable
    const rows = items.flatMap((e) =>
      e.elementId !== null && e.x !== null && e.y !== null
        ? [{ spaceId: created.id, elementId: e.elementId, x: e.x, y: e.y }]
        : [],
    );

    // inserting an empty array throws in drizzle
    if (rows.length > 0) {
      await tx.insert(spaceElements).values(rows);
    }

    return created;
  });

  return ApiResponse({ spaceId: space.id });
};

const deleteSpace = async ({ params, set, user }: AuthedContext) => {
  const spaceId = params.spaceId;

  const [space] = await db
    .select()
    .from(spaces)
    .where(eq(spaces.id, spaceId))
    .limit(1);

  if (!space) {
    set.status = 400;
    return ApiError("space not found");
  }

  if (space.creatorId !== user.id) {
    set.status = 403;
    return ApiError("Unauthorized");
  }

  await db.delete(spaces).where(eq(spaces.id, spaceId));

  return { message: "space deleted" };
};

const getExistingSpace = async ({ user }: AuthedContext) => {
  const userId = user.id;

  const space = await db
    .select()
    .from(spaces)
    .where(eq(spaces.creatorId, userId));

  return ApiResponse({
    spaces: space.map((s) => ({
      id: s.id,
      name: s.name,
      dimension: `${s.width}x${s.height}`,
      thumbnail: s.thumbnail,
    })),
  });
};

const getSpace = async ({ params, set }: AuthedContext) => {
  const spaceId = params.spaceId;

  const [space] = await db
    .select()
    .from(spaces)
    .where(eq(spaces.id, spaceId))
    .limit(1);

  if (!space) {
    set.status = 404;
    return ApiError("Space not found");
  }

  const rows = await db
    .select({
      id: spaceElements.id,
      x: spaceElements.x,
      y: spaceElements.y,
      elements: {
        id: elements.id,
        imageUrl: elements.imageUrl,
        widht: elements.width,
        height: elements.height,
      },
    })
    .from(spaceElements)
    .innerJoin(elements, eq(spaceElements.elementId, elements.id))
    .where(eq(spaceElements.spaceId, spaceId));

  return ApiResponse({
    dimensions: `${space.width}x${space.height}`,
    elements: rows,
  });
};

const addElement = async ({ body, set, user }: AuthedContext) => {
  const { success, data } = AddElementSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { elementId, spaceId, x, y } = data;

  const creatorId = user.id;

  const [space] = await db
    .select()
    .from(spaces)
    .where(and(eq(spaces.id, spaceId), eq(spaces.creatorId, creatorId)))
    .limit(1);

  if (!space) {
    set.status = 400;
    return ApiError("Space not found");
  }

  if (x > space.width || y > space.height) {
    set.status = 400;
    return ApiError("Point is outside the space boundary");
  }

  await db.insert(spaceElements).values({
    elementId,
    spaceId,
    x,
    y,
  });

  return { message: "elements created" };
};

const deleteElement = async ({ body, set, user }: AuthedContext) => {
  const { success, data } = DeleteElementSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { id } = data;

  const [spaceElement] = await db
    .select({ id: spaceElements.id, creatorId: spaces.creatorId })
    .from(spaceElements)
    .innerJoin(spaces, eq(spaceElements.spaceId, spaces.id))
    .where(eq(spaceElements.id, id))
    .limit(1);

  if (!spaceElement || spaceElement.creatorId !== user.id) {
    set.status = 403;
    return ApiError("Unauthorized");
  }

  await db.delete(spaceElements).where(eq(spaceElements.id, id));

  return { message: "element deleted" };
};

export {
  createSpace,
  deleteSpace,
  getExistingSpace,
  getSpace,
  addElement,
  deleteElement,
};
