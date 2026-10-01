import { Elysia } from "elysia";
import {
  createSpace,
  deleteSpace,
  getExistingSpace,
  getSpace,
  addElement,
  deleteElement,
} from "../../controllers/space.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = new Elysia()
  .use(authMiddleware)
  .post("/", createSpace)
  .delete("/:spaceId", deleteSpace)
  .get("/all", getExistingSpace)
  .get("/:spaceId", getSpace)
  .post("/element", addElement)
  .delete("/element", deleteElement);

export default router;
