import { Response } from "express";
import { CommentsService } from "./comments.service";
import { ICreateComment, IUpdateComment } from "./comments.interface";
import { AuthenticatedRequest, AuthenticatedRequestBot } from "../auth/auth.interface";
import { uploadMultiple, createAttachment } from '../middleware/upload.middleware';

const commentsService = new CommentsService();

export class CommentsController {

  async createComment(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    uploadMultiple(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const commentData: ICreateComment = req.body;
        const user = req?.user ? req.user : req.bot;

        let attachments = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          attachments = (req.files as Express.Multer.File[]).map(createAttachment);
        }

        const commentDataWithAttachments = {
          ...commentData,
          attachments: attachments.length > 0 ? attachments : undefined
        };

        const comment = await commentsService.createComment(commentDataWithAttachments, user);
        res.status(201).json({
          success: true,
          data: comment,
          message: 'Комментарий успешно создан'
        });
      } catch (error) {
        res.status(error.status || 500).json({
          success: false,
          message: error.message
        });
      }
    });
  }

  async getCommentsByTask(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    try {
      const taskId = parseInt(req.params.taskId);
      const comments = await commentsService.getCommentsByTask(taskId);
      res.json(comments);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getCommentsByRequest(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    try {
      const requestId = parseInt(req.params.requestId);
      const comments = await commentsService.getCommentsByRequest(requestId);
      res.json(comments);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async updateComment(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    try {
      const commentId = parseInt(req.params.commentId);
      const commentData: IUpdateComment = req.body;
      const user = req?.user ? req.user : req.bot;
      const comment = await commentsService.updateComment(commentId, commentData, user);
      res.json(comment);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async deleteComment(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    try {
      const commentId = parseInt(req.params.commentId);
      const user = req?.user ? req.user : req.bot;

      const result = await commentsService.deleteComment(commentId, user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

}
