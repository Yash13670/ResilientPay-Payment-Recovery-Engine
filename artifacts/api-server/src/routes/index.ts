import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentRouter from "./agent";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/agent", agentRouter);

export default router;
