import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contentRouter from "./content";
import facultyRouter from "./faculty";
import coursesRouter from "./courses";
import galleryRouter from "./gallery";
import resultsRouter from "./results";
import uploadsRouter from "./uploads";
import contactRouter from "./contact";
import coursesMegaMenuRouter from "./courses-mega-menu";
import allCoursesPageRouter from "./all-courses-page";
import knowledgeHubMegaMenuRouter from "./knowledge-hub-mega-menu";
import knowledgeHubArticlesRouter from "./knowledge-hub-articles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contentRouter);
router.use(facultyRouter);
router.use(coursesRouter);
router.use(coursesMegaMenuRouter);
router.use(allCoursesPageRouter);
router.use(knowledgeHubMegaMenuRouter);
router.use(knowledgeHubArticlesRouter);
router.use(galleryRouter);
router.use(resultsRouter);
router.use(contactRouter);
router.use(uploadsRouter);

export default router;
