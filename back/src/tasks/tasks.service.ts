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

  async updateTask(taskData: IUpdateTask) {
    const { idTask, ...data } = taskData
    const exTask = await this.getTaskById(idTask);
    for (const key in data) {
      if (data[key] !== undefined) {
        exTask[key] = data[key];
      }
    }
    try {
      taskRepository.save(exTask);
    } catch (error) {
      throw createError(500, "Error updating task");
    }

  }

  async deleteTask(id: number, creatorId: string) {
    const task = await this.getTaskById(id);
    const exCreator = await employeeRepository.findOne({ where: { user: { id: creatorId } }, relations: ["user"] });
    if (exCreator.id === task.creator.id ||
      exCreator.user.role === UserRoleEnum.ADMIN) {
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
    const { page, limit, ...data } = filter;
    const queryB = taskRepository.createQueryBuilder("task");
    queryB.leftJoinAndSelect("task.assignee", "assignee");
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
      queryB.andWhere("task.creatorId = :creatorId",
        { creatorId: data.creatorId });
    }
    if (data.assigneesId) {
      queryB.andWhere("task.assigneesId IN (:...assigneesId)",
        { assigneesId: data.assigneesId });
    }
    queryB.skip((page - 1) * limit).take(limit);
    const [tasks, total] = await queryB.getManyAndCount();
    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
}