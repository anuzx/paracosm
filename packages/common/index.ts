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

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
