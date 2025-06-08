import { Request, Response } from "express";
import { CommentsService } from "./comments.service";
import { ICreateComment, IUpdateComment } from "./comments.interface";
import { AuthenticatedRequest } from "../auth/auth.interface";

const commentsService = new CommentsService();

export class CommentsController {

  async createComment(req: AuthenticatedRequest, res: Response) {
    try {
      const commentData: ICreateComment = req.body;
      const user = req.user;
      
      const comment = await commentsService.createComment(commentData, user);
      res.status(201).json(comment);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getCommentsByTask(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.taskId);
      const comments = await commentsService.getCommentsByTask(taskId);
      res.json(comments);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getCommentsByRequest(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.requestId);
      const comments = await commentsService.getCommentsByRequest(requestId);
      res.json(comments);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async updateComment(req: AuthenticatedRequest, res: Response) {
    try {
      const commentId = req.params.commentId;
      const commentData: IUpdateComment = req.body;
      const user = req.user;
      
      const comment = await commentsService.updateComment(commentId, commentData, user);
      res.json(comment);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async deleteComment(req: AuthenticatedRequest, res: Response) {
    try {
      const commentId = req.params.commentId;
      const user = req.user;
      
      const result = await commentsService.deleteComment(commentId, user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}
