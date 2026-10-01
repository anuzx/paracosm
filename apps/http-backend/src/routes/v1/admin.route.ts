import { Elysia } from "elysia";
import {
  createElement,
  updateElement,
  createAvatar,
  createMap,
} from "../../controllers/admin.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = new Elysia()
  .use(authMiddleware)
  .post("/element", createElement)
  .put("/element/:elementId", updateElement)
  .post("/avatar", createAvatar)
  .post("/map", createMap);

export default router;
