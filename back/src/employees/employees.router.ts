import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { EmployeesController } from "./employees.controller";
import { UserRoleEnum } from "../commons/enums/enums";

const employeesRouter = Router();
const employeesController = new EmployeesController();

employeesRouter.get("/account/me", authMiddleware(), employeesController.getEmployeeAccountById);
employeesRouter.get("/employees", authMiddleware(), employeesController.getAllEmployees);
employeesRouter.get("/employees/:id", authMiddleware(), employeesController.getEmployeeById);
employeesRouter.post("/employees/create", authMiddleware([UserRoleEnum.ADMIN]), employeesController.createEmployee);
employeesRouter.put("/employees/update/me", authMiddleware(), employeesController.updateEmployee);
employeesRouter.put("/employees/update", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR, UserRoleEnum.MANAGER]), employeesController.updateAnotherEmployee);
employeesRouter.delete("/employees/:id", authMiddleware([UserRoleEnum.ADMIN]), employeesController.deleteEmployee);


export {
  employeesRouter
}