import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { TasksStatisticsController } from "./tasks-statistics.controller";
import { authMiddleware, authMiddlewareBot } from "../auth/auth.middleware";

const taskRouter = Router();
const tasksController = new TasksController();
const tasksStatisticsController = new TasksStatisticsController();

taskRouter.get("/", authMiddleware(), tasksController.getAllTasks);
taskRouter.get("/stats", authMiddleware(), tasksController.getTaskStats);
taskRouter.get("/recent", authMiddleware(), tasksController.getRecentTasks);

//routes for statistics
taskRouter.get("/statistics", authMiddleware(), tasksStatisticsController.getStatistics);
taskRouter.get("/statistics/total", authMiddleware(), tasksStatisticsController.getTotalStatistics);
taskRouter.get("/statistics/personal", authMiddleware(), tasksStatisticsController.getPersonalStatistics);
taskRouter.get("/statistics/export", authMiddleware(), tasksStatisticsController.exportToExcel);

//routes for bots
taskRouter.get("/bots/", authMiddlewareBot(), tasksController.getAllTasksForBot);
taskRouter.get("/bots/status/:status", authMiddlewareBot(), tasksController.getTasksByStatus);
taskRouter.get("/bots/priority/:priority", authMiddlewareBot(), tasksController.getTasksByPriority);
taskRouter.get("/bots/:id", authMiddlewareBot(), tasksController.getTaskById);

taskRouter.get("/assignee/:assigneeId", authMiddleware(), tasksController.getTasksByAssignee);
taskRouter.get("/creator/:creatorId", authMiddleware(), tasksController.getTasksByCreator);
taskRouter.get("/status/:status", authMiddleware(), tasksController.getTasksByStatus);
taskRouter.get("/priority/:priority", authMiddleware(), tasksController.getTasksByPriority);
taskRouter.get("/:id", authMiddleware(), tasksController.getTaskById);

taskRouter.post("/create", authMiddleware(), tasksController.createTask);
taskRouter.put("/update/:id", authMiddleware(), tasksController.updateTask);
taskRouter.patch("/:id/status", authMiddleware(), tasksController.updateTaskStatus);
taskRouter.delete("/:id", authMiddleware(), tasksController.deleteTask);


export { taskRouter };