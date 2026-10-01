import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string().trim().min(3).max(32),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "user"]),
});

export const SigninSchema = SignupSchema.pick({
  username: true,
  password: true,
});

export const UpdateMetadataSchema = z.object({
  avatarId: z.string(),
});

export const CreateSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  mapId: z.string(),
});

export const AddElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number().positive(),
  y: z.number().positive(),
});

export const DeleteElementSchema = z.object({
  id: z.string(),
});

export const CreateElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const UpdateElementSchema = z.object({
  imageUrl: z.string(),
});

export const CreateAvatarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

export const CreateMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  name: z.string(),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    }),
  ),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
