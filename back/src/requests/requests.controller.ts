import { AuthenticatedRequest } from "../auth/auth.interface";
import { IUpdateRequest } from "./requests.interface";
import { RequestsService } from "./requests.service";
import { Request, Response } from "express";

const requestsService = new RequestsService();

export class RequestsController {
  async createRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const requestData = req.body;
      requestData.userId = req.user.userId;
      const createdRequest = await requestsService.createRequest(requestData);
      res.status(201).json(createdRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const requestData = req.body as IUpdateRequest;
      requestData.id = parseInt(req.params.id);
      await requestsService.updateRequest(requestData, req.user.userId);
      res.status(200).json({ message: "Request updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await requestsService.deleteRequest(parseInt(id), req.user.userId);
      res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const request = await requestsService.getRequestById(parseInt(id));
      res.status(200).json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getAllRequests(req: Request, res: Response) {
    try {
      const filter = req.query;
      const requests = await requestsService.getAllRequests(filter);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getRequestsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const requests = await requestsService.getRequestsByStatus(status);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getRequestsByEmployeeId(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const requests = await requestsService.getAllRequestsByEmployeeId(employeeId);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

}