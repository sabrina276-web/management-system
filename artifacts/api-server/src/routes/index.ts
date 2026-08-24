import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import appointmentsRouter from "./appointments";
import billingRouter from "./billing";
import inventoryRouter from "./inventory";
import dashboardRouter from "./dashboard";
import employeesRouter from "./employees";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(billingRouter);
router.use(inventoryRouter);
router.use(dashboardRouter);
router.use(employeesRouter);

export default router;
