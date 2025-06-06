import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { authMiddleware } from "../auth/auth.middleware";

const taskRouter = Router();
const tasksController = new TasksController();

taskRouter.get("/", authMiddleware(), tasksController.getAllTasks);
taskRouter.get("/stats", authMiddleware(), tasksController.getTaskStats);
taskRouter.get("/recent", authMiddleware(), tasksController.getRecentTasks);
taskRouter.get("/:id", authMiddleware(), tasksController.getTaskById);
taskRouter.get("/assignee/:assigneeId", authMiddleware(), tasksController.getTasksByAssignee);
taskRouter.get("/creator/:creatorId", authMiddleware(), tasksController.getTasksByCreator);
taskRouter.get("/status/:status", authMiddleware(), tasksController.getTasksByStatus);
taskRouter.get("/priority/:priority", authMiddleware(), tasksController.getTasksByPriority);
taskRouter.post("/create", authMiddleware(), tasksController.createTask);
taskRouter.put("/update/:id", authMiddleware(), tasksController.updateTask);
taskRouter.delete("/:id", authMiddleware(), tasksController.deleteTask);

export { taskRouter };