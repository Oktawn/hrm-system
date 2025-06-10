import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { PositionsController } from "./positions.controller";
import { UserRoleEnum } from "../commons/enums/enums";

const positionsRouter = Router();
const positionsController = new PositionsController();

positionsRouter.get("/", authMiddleware(), positionsController.getAllPositions);
positionsRouter.get("/department/:departmentId", authMiddleware(), positionsController.getPositionsByDepartment);
positionsRouter.get("/:id", authMiddleware(), positionsController.getPositionById);
positionsRouter.post("/", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), positionsController.createPosition);
positionsRouter.put("/:id", authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]), positionsController.updatePosition);
positionsRouter.delete("/:id", authMiddleware([UserRoleEnum.ADMIN]), positionsController.deletePosition);

export { positionsRouter };
