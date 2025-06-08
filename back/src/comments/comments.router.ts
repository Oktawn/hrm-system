import { Router } from "express";
import { CommentsController } from "./comments.controller";
import { authMiddleware } from "../auth/auth.middleware";

const commentsController = new CommentsController();
const commentsRouter = Router();

// Создать комментарий
commentsRouter.post("/", authMiddleware(), commentsController.createComment);

// Получить комментарии для задачи
commentsRouter.get("/task/:taskId", authMiddleware(), commentsController.getCommentsByTask);

// Получить комментарии для заявки
commentsRouter.get("/request/:requestId", authMiddleware(), commentsController.getCommentsByRequest);

// Обновить комментарий
commentsRouter.put("/:commentId", authMiddleware(), commentsController.updateComment);

// Удалить комментарий
commentsRouter.delete("/:commentId", authMiddleware(), commentsController.deleteComment);

export { commentsRouter };
