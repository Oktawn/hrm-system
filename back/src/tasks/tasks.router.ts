import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { authMiddleware } from "../auth/auth.middleware";

const taskRouter = Router();
const tasksController = new TasksController();

taskRouter.get("/tasks", authMiddleware(), tasksController.getAllTasks);
taskRouter.get("/tasks/:id", authMiddleware(), tasksController.getTaskById);
taskRouter.get("/tasks/assignee/:assigneeId", authMiddleware(), tasksController.getTasksByAssignee);
taskRouter.get("/tasks/creator/:creatorId", authMiddleware(), tasksController.getTasksByCreator);
taskRouter.get("/tasks/status/:status", authMiddleware(), tasksController.getTasksByStatus);
taskRouter.get("/tasks/priority/:priority", authMiddleware(), tasksController.getTasksByPriority);
taskRouter.post("/tasks/create", authMiddleware(), tasksController.createTask);
taskRouter.put("/tasks/update/:id", authMiddleware(), tasksController.updateTask);
taskRouter.delete("/tasks/:id", authMiddleware(), tasksController.deleteTask);