import { Router } from "express";
import { RequestsController } from "./requests.controller";
import { authMiddleware } from "../auth/auth.middleware";


const requestsController = new RequestsController();

const requestRouter = Router();

requestRouter.get("/", authMiddleware(), requestsController.getAllRequests);
requestRouter.get("/:id", authMiddleware(), requestsController.getRequestById);
requestRouter.get("/status/:status", authMiddleware(), requestsController.getRequestsByStatus);
requestRouter.get("/employee/:employeeId", authMiddleware(), requestsController.getRequestsByEmployeeId);
requestRouter.post("/create", authMiddleware(), requestsController.createRequest);
requestRouter.put("/update/:id", authMiddleware(), requestsController.updateRequest);
requestRouter.delete("/:id", authMiddleware(), requestsController.deleteRequest);

export { requestRouter };