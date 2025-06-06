import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { EmployeesController } from "./employees.controller";
import { UserRoleEnum } from "../commons/enums/enums";

const employeesRouter = Router();
const employeesController = new EmployeesController();

employeesRouter.get("/account/me", authMiddleware(), employeesController.getEmployeeAccountById);
employeesRouter.get("/stats", authMiddleware(), employeesController.getEmployeeStats);
employeesRouter.get("/", authMiddleware(), employeesController.getAllEmployees);
employeesRouter.get("/:id", authMiddleware(), employeesController.getEmployeeById);
employeesRouter.post("/create", authMiddleware([UserRoleEnum.ADMIN]), employeesController.createEmployee);
employeesRouter.put("/update/me", authMiddleware(), employeesController.updateEmployee);
employeesRouter.put("/update", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR, UserRoleEnum.MANAGER]), employeesController.updateAnotherEmployee);
employeesRouter.delete("/:id", authMiddleware([UserRoleEnum.ADMIN]), employeesController.deleteEmployee);


export {
  employeesRouter
}