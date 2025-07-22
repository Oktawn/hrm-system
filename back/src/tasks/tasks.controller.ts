import { Request, Response, NextFunction } from 'express';
import { TasksService } from "./tasks.service";
import { ICreateTask, IUpdateTask } from './tasks.interface';
import { AuthenticatedRequest, AuthenticatedRequestBot } from '../auth/auth.interface';
import { uploadMultiple, createAttachment } from '../middleware/upload.middleware';

const tasksService = new TasksService();

export class TasksController {

  async getAllTasks(req: Request, res: Response, next: NextFunction) {
    const filter = req.query;
    try {
      const tasks = await tasksService.getAllTasks(filter);
      res.status(200).json({
        success: true,
        ...tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTasksForBot(req: AuthenticatedRequestBot, res: Response, next: NextFunction) {
    const tgID = req.bot.tgID;
    try {
      const tasks = await tasksService.getAllTasksForBot(tgID);
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const task = await tasksService.getTaskById(Number(id));
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasksByAssignee(req: Request, res: Response, next: NextFunction) {
    const { assigneeId } = req.params;
    try {
      const tasks = await tasksService.getTasksByAssignee(assigneeId);
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasksByCreator(req: Request, res: Response, next: NextFunction) {
    const { creatorId } = req.params;
    try {
      const tasks = await tasksService.getTasksByCreator(creatorId);
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasksByStatus(req: Request, res: Response, next: NextFunction) {
    const { status } = req.params;
    try {
      const tasks = await tasksService.getTasksByStatus(status);
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }
  async getTasksByPriority(req: Request, res: Response, next: NextFunction) {
    const { priority } = req.params;
    try {
      const tasks = await tasksService.getTasksByPriority(priority);
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const taskData = req.body;
        if (taskData.assigneesId) {
          if (typeof taskData.assigneesId === 'string') {
            taskData.assigneesId = [taskData.assigneesId];
          }
        }

        let attachments = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          const uploadPromises = (req.files as Express.Multer.File[]).map(createAttachment);
          attachments = await Promise.all(uploadPromises);
        }

        const taskDataWithAttachments: ICreateTask = {
          ...taskData,
          creatorId: req.user.userId,
          attachments: attachments.length > 0 ? attachments : undefined
        };

        const result = await tasksService.createTask(taskDataWithAttachments);
        res.status(201).json({
          success: true,
          message: "Task created successfully",
          data: result,
        });
      } catch (error) {
        next(error);
      }
    });
  }
  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const taskData = req.body as IUpdateTask;
    try {
      const result = await tasksService.updateTask(taskData, req.user.userId);
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: result,
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
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await tasksService.getTaskStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const tasks = await tasksService.getRecentTasks(limit);
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      const task = await tasksService.updateTaskStatus(taskId, status, req.user.userId);
      res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
}