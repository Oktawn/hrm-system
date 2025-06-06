import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { PositionsController } from "./positions.controller";
import { UserRoleEnum } from "../commons/enums/enums";

const positionsRouter = Router();
const positionsController = new PositionsController();

// Получить все должности (доступно всем авторизованным пользователям)
positionsRouter.get("/", authMiddleware(), positionsController.getAllPositions);

// Получить должности по отделу (доступно всем авторизованным пользователям)
positionsRouter.get("/department/:departmentId", authMiddleware(), positionsController.getPositionsByDepartment);

// Получить должность по ID (доступно всем авторизованным пользователям)
positionsRouter.get("/:id", authMiddleware(), positionsController.getPositionById);

// Создать новую должность (только для ADMIN и HR)
positionsRouter.post("/", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), positionsController.createPosition);

// Обновить должность (только для ADMIN и HR)
positionsRouter.put("/:id", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), positionsController.updatePosition);

// Удалить должность (только для ADMIN)
positionsRouter.delete("/:id", authMiddleware([UserRoleEnum.ADMIN]), positionsController.deletePosition);

export { positionsRouter };
