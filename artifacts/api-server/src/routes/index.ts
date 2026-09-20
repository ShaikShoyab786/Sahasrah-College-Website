import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contentRouter from "./content";
import uploadsRouter from "./uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contentRouter);
router.use(uploadsRouter);

export default router;
