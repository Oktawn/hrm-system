import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { DepartmentsController } from "./departments.controller";
import { UserRoleEnum } from "../commons/enums/enums";

const departmentsRouter = Router();
const departmentsController = new DepartmentsController();

departmentsRouter.get("/", authMiddleware(), departmentsController.getAllDepartments);
departmentsRouter.get("/stats", authMiddleware(), departmentsController.getDepartmentStats);
departmentsRouter.get("/:id", authMiddleware(), departmentsController.getDepartmentById);
departmentsRouter.post("/", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), departmentsController.createDepartment);
departmentsRouter.put("/:id", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), departmentsController.updateDepartment);
departmentsRouter.delete("/:id", authMiddleware([UserRoleEnum.ADMIN]), departmentsController.deleteDepartment);

export { departmentsRouter };
