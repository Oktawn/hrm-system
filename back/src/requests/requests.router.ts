import { Router } from "express";
import { RequestsController } from "./requests.controller";
import { authMiddleware, authMiddlewareBot } from "../auth/auth.middleware";


const requestsController = new RequestsController();

const requestRouter = Router();

requestRouter.get("/bot/", authMiddlewareBot(), requestsController.getRequestsForBot);
requestRouter.get("/bot/status/:status", authMiddlewareBot(), requestsController.getRequestsByStatus);
requestRouter.get("/bot/employee/:employeeId", authMiddlewareBot(), requestsController.getRequestsByEmployeeId);
requestRouter.get("/bot/priority/:priority", authMiddlewareBot(), requestsController.getRequestsByPriority);
requestRouter.get("/bot/employee/:name", authMiddlewareBot(), requestsController.getRequestsByEmployeeName);
requestRouter.get("/bot/:id", authMiddlewareBot(), requestsController.getRequestById);
requestRouter.post("/bot/create", authMiddlewareBot(), requestsController.createRequest);
requestRouter.put("/bot/update/:id", authMiddlewareBot(), requestsController.updateRequest);
requestRouter.patch("/bot/:id/status", authMiddlewareBot(), requestsController.updateRequestStatus);


requestRouter.get("/", authMiddleware(), requestsController.getAllRequests);
requestRouter.get("/status/:status", authMiddleware(), requestsController.getRequestsByStatus);
requestRouter.get("/priority/:priority", authMiddleware(), requestsController.getRequestsByPriority);
requestRouter.get("/employee/:employeeId", authMiddleware(), requestsController.getRequestsByEmployeeId);
requestRouter.get("/:id", authMiddleware(), requestsController.getRequestById);
requestRouter.post("/create", authMiddleware(), requestsController.createRequest);
requestRouter.put("/update/:id", authMiddleware(), requestsController.updateRequest);
requestRouter.patch("/:id/status", authMiddleware(), requestsController.updateRequestStatus);
requestRouter.delete("/:id", authMiddleware(), requestsController.deleteRequest);



export { requestRouter };