import createError from "http-errors";
import { commentRepository, employeeRepository, taskRepository, requestRepository } from "../db/db-rep";
import { ICreateComment, IUpdateComment } from "./comments.interface";
import { BotPayload, TokenPayload } from "../auth/auth.interface";
import { UserRoleEnum } from "../commons/enums/enums";

export class CommentsService {

  async createComment(commentData: ICreateComment, user: TokenPayload | BotPayload) {
    const employee = await employeeRepository.findOneBy({ user: { id: user.userId } });
    if (!employee) {
      throw createError(404, "Employee not found");
    }

    if (commentData.type === 'task' && commentData.taskId) {
      const task = await taskRepository.findOneBy({ id: commentData.taskId });
      if (!task) {
        throw createError(404, "Task not found");
      }
    } else if (commentData.type === 'request' && commentData.requestId) {
      const request = await requestRepository.findOneBy({ id: commentData.requestId });
      if (!request) {
        throw createError(404, "Request not found");
      }
    } else {
      throw createError(400, "Invalid comment data");
    }

    const comment = commentRepository.create({
      content: commentData.content,
      type: commentData.type,
      author: employee,
      task: commentData.type === 'task' ? { id: commentData.taskId } : null,
      request: commentData.type === 'request' ? { id: commentData.requestId } : null,
      attachments: commentData.attachments || null,
    });

    const savedComment = await commentRepository.save(comment);

    return {
      id: savedComment.id,
      content: savedComment.content,
      type: savedComment.type,
      created_at: savedComment.created_at,
      updated_at: savedComment.updated_at,
      author: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName
      },
      attachments: savedComment.attachments || []

    }
  }


  async getCommentsByTask(taskId: number) {
    return await commentRepository.find({
      where: { task: { id: taskId }, type: 'task' },
      relations: ['author'],
      order: { created_at: 'ASC' },
      select: {
        id: true,
        content: true,
        type: true,
        created_at: true,
        updated_at: true,
        author: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true
        }
      }
    });
  }

  async getCommentsByRequest(requestId: number) {
    return await commentRepository.find({
      where: { request: { id: requestId }, type: 'request' },
      relations: ['author'],
      order: { created_at: 'ASC' },
      select: {
        id: true,
        content: true,
        type: true,
        created_at: true,
        updated_at: true,
        author: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true
        }
      }
    });
  }

  async updateComment(commentId: number, commentData: IUpdateComment, user: TokenPayload) {
    const comment = await commentRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'author.user']
    });

    if (!comment) {
      throw createError(404, "Comment not found");
    }

    if (comment.author.user.id !== user.userId && user.role === UserRoleEnum.EMPLOYEE) {
      throw createError(403, "You can only edit your own comments or you must be a manager");
    }

    comment.content = commentData.content;
    const savedComment = await commentRepository.save(comment);

    return {
      id: savedComment.id,
      content: savedComment.content,
      type: savedComment.type,
      created_at: savedComment.created_at,
      updated_at: savedComment.updated_at,
      author: {
        id: savedComment.author.id,
        firstName: savedComment.author.firstName,
        lastName: savedComment.author.lastName,
        middleName: savedComment.author.middleName
      },
      attachments: savedComment.attachments || []
    };
  }

  async deleteComment(commentId: number, user: TokenPayload) {
    const comment = await commentRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'author.user']
    });

    if (!comment) {
      throw createError(404, "Comment not found");
    }
    if (comment.author.user.id !== user.userId && user.role === UserRoleEnum.EMPLOYEE) {
      throw createError(403, "You can only delete your own comments or you must be a manager");
    }

    await commentRepository.remove(comment);
    return { message: "Comment deleted successfully" };
  }
}
