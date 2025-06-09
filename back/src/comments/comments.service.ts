import createError from "http-errors";
import { commentRepository, employeeRepository, taskRepository, requestRepository } from "../db/db-rep";
import { ICreateComment, IUpdateComment } from "./comments.interface";
import { TokenPayload } from "../auth/auth.interface";

export class CommentsService {
  
  async createComment(commentData: ICreateComment, user: TokenPayload) {
    const employee = await employeeRepository.findOneBy({ user: { id: user.userId } });
    if (!employee) {
      throw createError(404, "Employee not found");
    }

    // Проверяем существование задачи или заявки
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
    
    return await commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author']
    });
  }

  async getCommentsByTask(taskId: number) {
    return await commentRepository.find({
      where: { task: { id: taskId }, type: 'task' },
      relations: ['author'],
      order: { created_at: 'ASC' }
    });
  }

  async getCommentsByRequest(requestId: number) {
    return await commentRepository.find({
      where: { request: { id: requestId }, type: 'request' },
      relations: ['author'],
      order: { created_at: 'ASC' }
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

    // Проверяем, что пользователь является автором комментария
    if (comment.author.user.id !== user.userId) {
      throw createError(403, "You can only edit your own comments");
    }

    comment.content = commentData.content;
    return await commentRepository.save(comment);
  }

  async deleteComment(commentId: number, user: TokenPayload) {
    const comment = await commentRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'author.user']
    });

    if (!comment) {
      throw createError(404, "Comment not found");
    }

    // Проверяем, что пользователь является автором комментария или менеджером
    if (comment.author.user.id !== user.userId && user.role !== 'admin' && user.role !== 'hr' && user.role !== 'manager') {
      throw createError(403, "You can only delete your own comments or you must be a manager");
    }

    await commentRepository.remove(comment);
    return { message: "Comment deleted successfully" };
  }
}
