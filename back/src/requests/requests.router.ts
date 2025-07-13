import { Router } from "express";
import { RequestsController } from "./requests.controller";
import { authMiddleware, authMiddlewareBot } from "../auth/auth.middleware";


const requestsController = new RequestsController();

const requestRouter = Router();

requestRouter.get("/", authMiddleware(), requestsController.getAllRequests);
requestRouter.get("/:id", authMiddleware(), requestsController.getRequestById);
requestRouter.get("/status/:status", authMiddleware(), requestsController.getRequestsByStatus);
requestRouter.get("/employee/:employeeId", authMiddleware(), requestsController.getRequestsByEmployeeId);
requestRouter.post("/create", authMiddleware(), requestsController.createRequest);
requestRouter.put("/update/:id", authMiddleware(), requestsController.updateRequest);
requestRouter.patch("/:id/status", authMiddleware(), requestsController.updateRequestStatus);
requestRouter.delete("/:id", authMiddleware(), requestsController.deleteRequest);

requestRouter.get("/bot/", authMiddlewareBot(), requestsController.getAllRequests);
requestRouter.get("/bot/:id", authMiddlewareBot(), requestsController.getRequestById);
requestRouter.get("/bot/status/:status", authMiddlewareBot(), requestsController.getRequestsByStatus);
requestRouter.get("/bot/employee/:employeeId", authMiddlewareBot(), requestsController.getRequestsByEmployeeId);
requestRouter.post("/bot/create", authMiddlewareBot(), requestsController.createRequest);
requestRouter.put("/bot/update/:id", authMiddlewareBot(), requestsController.updateRequest);
requestRouter.patch("/bot/:id/status", authMiddlewareBot(), requestsController.updateRequestStatus);

export { requestRouter };