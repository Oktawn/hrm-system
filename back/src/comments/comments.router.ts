import { Router } from "express";
import { CommentsController } from "./comments.controller";
import { authMiddleware, authMiddlewareBot } from "../auth/auth.middleware";

const commentsController = new CommentsController();
const commentsRouter = Router();

commentsRouter.post("/", authMiddleware(), commentsController.createComment);
commentsRouter.get("/task/:taskId", authMiddleware(), commentsController.getCommentsByTask);
commentsRouter.get("/request/:requestId", authMiddleware(), commentsController.getCommentsByRequest);
commentsRouter.put("/:commentId", authMiddleware(), commentsController.updateComment);
commentsRouter.delete("/:commentId", authMiddleware(), commentsController.deleteComment);

commentsRouter.post('/bot/', authMiddlewareBot(), commentsController.createComment);
commentsRouter.put("/bot/:commentId", authMiddlewareBot(), commentsController.updateComment);


export { commentsRouter };
