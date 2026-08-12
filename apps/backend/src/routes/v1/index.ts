import { Router } from "express";
import userRouter from "./user.route";
import spaceRouter from "./space.route";
import adminRouter from "./admin.route";

export const router = Router();

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
