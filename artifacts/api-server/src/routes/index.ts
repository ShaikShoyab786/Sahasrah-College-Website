import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contentRouter from "./content";
import facultyRouter from "./faculty";
import galleryRouter from "./gallery";
import resultsRouter from "./results";
import uploadsRouter from "./uploads";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contentRouter);
router.use(facultyRouter);
router.use(galleryRouter);
router.use(resultsRouter);
router.use(contactRouter);
router.use(uploadsRouter);

export default router;
