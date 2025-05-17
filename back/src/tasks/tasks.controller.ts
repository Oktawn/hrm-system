import { Request, Response, NextFunction } from 'express';
import { TasksService } from "./tasks.service";
import { ICreateTask, IUpdateTask } from './tasks.interface';
import { AuthenticatedRequest } from '../auth/auth.interface';

const tasksService = new TasksService();

export class TasksController {

  async getAllTasks(req: Request, res: Response, next: NextFunction) {
    const filter = req.query;
    try {
      const tasks = await tasksService.getAllTasks(filter);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const task = await tasksService.getTaskById(Number(id));
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async getTasksByAssignee(req: Request, res: Response, next: NextFunction) {
    const { assigneeId } = req.params;
    try {
      const tasks = await tasksService.getTasksByAssignee(assigneeId);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTasksByCreator(req: Request, res: Response, next: NextFunction) {
    const { creatorId } = req.params;
    try {
      const tasks = await tasksService.getTasksByCreator(creatorId);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTasksByStatus(req: Request, res: Response, next: NextFunction) {
    const { status } = req.params;
    try {
      const tasks = await tasksService.getTasksByStatus(status);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }
  async getTasksByPriority(req: Request, res: Response, next: NextFunction) {
    const { priority } = req.params;
    try {
      const tasks = await tasksService.getTasksByPriority(priority);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const taskData: ICreateTask = {
      ...req.body,
      creatorId: req.user.userId,
    };
    try {
      await tasksService.createTask(taskData);
      res.status(201).json({
        message: "Task created successfully",
        data: taskData,
      });
    } catch (error) {
      next(error);
    }
  }
  async updateTask(req: Request, res: Response, next: NextFunction) {
    const taskData = req.body as IUpdateTask;
    try {
      await tasksService.updateTask(taskData);
      res.status(200).json({
        message: "Task updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      await tasksService.deleteTask(Number(id), req.user.userId);
      res.status(200).json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}