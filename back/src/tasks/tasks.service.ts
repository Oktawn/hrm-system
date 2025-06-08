import createError from "http-errors";
import { ICreateTask, ITaskFilter, IUpdateTask } from "./tasks.interface";
import { employeeRepository, taskRepository } from "../db/db-rep";
import { In } from "typeorm";
import { TaskPriorityEnum, TaskStatusEnum, UserRoleEnum } from "../commons/enums/enums";

export class TasksService {

  async createTask(taskData: ICreateTask) {
    const exCreator = await employeeRepository.findOne({ where: { user: { id: taskData.creatorId } } });
    if (!exCreator) {
      throw createError(404, "Creator not found");
    }
    const newTask = taskRepository.create({
      ...taskData,
      creator: exCreator,
      assignees: [],
      deadline: taskData.deadline ? new Date(taskData.deadline) : undefined,
    });
    if (taskData.assigneesId) {
      let exAssignees = await employeeRepository.findBy({ id: In(taskData.assigneesId) })
      if (exAssignees.length !== taskData.assigneesId.length) {
        throw createError(404, "One or more assignees not found");
      }
      newTask.assignees = exAssignees;
    }
    try {
      await taskRepository.save(newTask);
      return {
        ...newTask,
        creator: newTask.creator ? {
          id: newTask.creator.id,
        } : null,
        assignees: newTask.assignees ? {
          id: newTask.assignees.map((assignee) => assignee.id),
        } : null,
      };
    } catch (error) {
      throw createError(500, "Error creating task");
    }
  }

  async updateTask(taskData: IUpdateTask, userId: string) {
    const { idTask, ...data } = taskData
    const exTask = await this.getTaskById(idTask);
    
    // Проверяем права на редактирование
    const exUser = await employeeRepository.findOne({ 
      where: { user: { id: userId } }, 
      relations: ["user"] 
    });
    
    if (!exUser) {
      throw createError(404, "User not found");
    }
    
    const isCreator = exTask.creator.id === exUser.id;
    const isAssignee = exTask.assignees.some(assignee => assignee.id === exUser.id);
    const isManager = ['admin', 'hr', 'manager'].includes(exUser.user.role);
    
    if (!isCreator && !isAssignee && !isManager) {
      throw createError(403, "Forbidden: You don't have permission to edit this task");
    }
    
    // Обрабатываем assigneesId отдельно
    if (data.assigneesId) {
      const exAssignees = await employeeRepository.findBy({ id: In(data.assigneesId) });
      if (exAssignees.length !== data.assigneesId.length) {
        throw createError(404, "One or more assignees not found");
      }
      exTask.assignees = exAssignees;
      delete data.assigneesId; // Удаляем из data, так как уже обработали
    }
    
    // Обновляем остальные поля
    for (const key in data) {
      if (data[key] !== undefined) {
        if (key === 'deadline' && data[key]) {
          exTask[key] = new Date(data[key]);
        } else {
          exTask[key] = data[key];
        }
      }
    }
    
    try {
      const savedTask = await taskRepository.save(exTask);
      return await this.getTaskById(savedTask.id); // Возвращаем полную задачу с relations
    } catch (error) {
      throw createError(500, "Error updating task");
    }
  }

  async deleteTask(id: number, creatorId: string) {
    const task = await this.getTaskById(id);
    const exCreator = await employeeRepository.findOne({ where: { user: { id: creatorId } }, relations: ["user"] });
    if (exCreator.id === task.creator.id ||
      exCreator.user.role === 'admin') {
      try {
        await taskRepository.remove(task);
      } catch (error) {
        throw createError(500, "Error deleting task");
      }
    } else {
      throw createError(403, "Forbidden");
    }

  }

  async getTaskById(id: number) {
    const task = await taskRepository.findOne({ where: { id }, relations: ["assignees", "creator"] });
    if (!task) {
      throw createError(404, "Task not found");
    }
    return task;

  }

  async getAllTasks(filter: ITaskFilter) {
    const data = { ...filter };
    
    // Обеспечиваем, что page и limit являются числами
    const pageNum = Number(data.page) || 1;
    const limitNum = Number(data.limit) || 10;
    
    // Удаляем page и limit из data для фильтрации
    delete data.page;
    delete data.limit;
    
    const queryB = taskRepository.createQueryBuilder("task");
    queryB.leftJoinAndSelect("task.assignees", "assignees");
    queryB.leftJoinAndSelect("task.creator", "creator");

    if (data.title) {
      queryB.andWhere("task.title LIKE :title",
        { title: `%${data.title}%` });
    }
    if (data.description) {
      queryB.andWhere("task.description LIKE :description",
        { description: `%${data.description}%` });
    }
    if (data.status) {
      queryB.andWhere("task.status = :status",
        { status: data.status });
    }
    if (data.priority) {
      queryB.andWhere("task.priority = :priority",
        { priority: data.priority });
    }
    if (data.deadline) {
      queryB.andWhere("task.deadline = :deadline",
        { deadline: data.deadline });
    }
    if (data.creatorId) {
      queryB.andWhere("creator.id = :creatorId",
        { creatorId: data.creatorId });
    }
    if (data.assigneesId) {
      queryB.andWhere("assignees.id IN (:...assigneesId)",
        { assigneesId: data.assigneesId });
    }
    queryB.skip((pageNum - 1) * limitNum).take(limitNum);
    const [tasks, total] = await queryB.getManyAndCount();
    return {
      data: tasks,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getTasksByAssignee(assigneeId: string) {
    const tasks = await taskRepository.find({
      where: { assignees: { id: assigneeId } },
      relations: ["assignees", "creator"],
    });
    return tasks;
  }

  async getTasksByCreator(creatorId: string) {
    const tasks = await taskRepository.find({
      where: { creator: { id: creatorId } },
      relations: ["assignees", "creator"],
    });
    return tasks;
  }

  async getTasksByStatus(status: string) {
    const tasks = await taskRepository.find({
      where: { status: TaskStatusEnum[status] },
      relations: ["assignees", "creator"],
    });
    return tasks;
  }

  async getTasksByPriority(priority: string) {
    const tasks = await taskRepository.find({
      where: { priority: TaskPriorityEnum[priority] },
      relations: ["assignees", "creator"],
    });
    return tasks;

  }

  async getTaskStats() {
    const totalTasks = await taskRepository.count();
    const todoTasks = await taskRepository.count({ where: { status: TaskStatusEnum.TODO } });
    const inProgressTasks = await taskRepository.count({ where: { status: TaskStatusEnum.IN_PROGRESS } });
    const reviewTasks = await taskRepository.count({ where: { status: TaskStatusEnum.REVIEW } });
    const doneTasks = await taskRepository.count({ where: { status: TaskStatusEnum.DONE } });
    const cancelledTasks = await taskRepository.count({ where: { status: TaskStatusEnum.CANCELLED } });

    return {
      total: totalTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      review: reviewTasks,
      done: doneTasks,
      cancelled: cancelledTasks
    };
  }

  async getRecentTasks(limit: number = 5) {
    return await taskRepository.find({
      relations: ["assignees", "creator"],
      order: { createdAt: "DESC" },
      take: limit
    });
  }

  async updateTaskStatus(taskId: number, status: TaskStatusEnum, userId: string) {
    const task = await taskRepository.findOne({
      where: { id: taskId },
      relations: ["creator", "assignees", "assignees.user"]
    });

    if (!task) {
      throw createError(404, "Task not found");
    }

    const employee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!employee) {
      throw createError(404, "Employee not found");
    }

    // Проверяем права на изменение статуса
    const isCreator = task.creator?.id === employee.id;
    const isAssignee = task.assignees.some(assignee => assignee.id === employee.id);
    const isManager = ['admin', 'hr', 'manager'].includes(employee.user.role);

    if (!isCreator && !isAssignee && !isManager) {
      throw createError(403, "You don't have permission to change this task status");
    }

    task.status = status;
    await taskRepository.save(task);

    return await this.getTaskById(taskId);
  }
}