import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { DepartmentsController } from "./departments.controller";
import { UserRoleEnum } from "../commons/enums/enums";

const departmentsRouter = Router();
const departmentsController = new DepartmentsController();

// Получить все отделы (доступно всем авторизованным пользователям)
departmentsRouter.get("/", authMiddleware(), departmentsController.getAllDepartments);

// Получить статистику по отделам (доступно всем авторизованным пользователям)
departmentsRouter.get("/stats", authMiddleware(), departmentsController.getDepartmentStats);

// Получить отдел по ID (доступно всем авторизованным пользователям)
departmentsRouter.get("/:id", authMiddleware(), departmentsController.getDepartmentById);

// Создать новый отдел (только для ADMIN и HR)
departmentsRouter.post("/", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), departmentsController.createDepartment);

// Обновить отдел (только для ADMIN и HR)
departmentsRouter.put("/:id", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), departmentsController.updateDepartment);

// Удалить отдел (только для ADMIN)
departmentsRouter.delete("/:id", authMiddleware([UserRoleEnum.ADMIN]), departmentsController.deleteDepartment);

export { departmentsRouter };
