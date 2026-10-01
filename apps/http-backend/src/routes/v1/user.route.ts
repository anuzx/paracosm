import { Elysia } from "elysia";
import {
  updateMetadata,
  usersMetadata,
} from "../../controllers/user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = new Elysia()
  .use(authMiddleware)
  .post("/metadata", updateMetadata)
  .get("/metadata/bulk", usersMetadata);

export default router;
