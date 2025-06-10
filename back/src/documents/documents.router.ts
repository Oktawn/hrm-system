import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { DocumentsController } from "./documents.controller";
import { UserRoleEnum } from "../commons/enums/enums";

const documentsRouter = Router();
const documentsController = new DocumentsController();

documentsRouter.get("/",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR, UserRoleEnum.MANAGER]),
  documentsController.getAllDocuments
);

documentsRouter.get("/:id",
  authMiddleware(),
  documentsController.getDocumentById
);

documentsRouter.get("/employee/:employeeId",
  authMiddleware(),
  documentsController.getDocumentsByRequestedBy
);

documentsRouter.get("/status/:status",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR, UserRoleEnum.MANAGER]),
  documentsController.getDocumentsByStatus
);

documentsRouter.post("/",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]),
  documentsController.createDocument
);

documentsRouter.post("/generate/:requestId",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]),
  documentsController.generateDocumentFromRequest
);

documentsRouter.post("/:id/regenerate",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]),
  documentsController.regenerateDocument
);

documentsRouter.put("/:id",
  authMiddleware(),
  documentsController.updateDocument
);

documentsRouter.patch("/:id/status",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR, UserRoleEnum.MANAGER]),
  documentsController.updateDocumentStatus
);

documentsRouter.patch("/:id/sign",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR, UserRoleEnum.MANAGER]),
  documentsController.signDocument
);

documentsRouter.patch("/:id/reject",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR, UserRoleEnum.MANAGER]),
  documentsController.rejectDocument
);

documentsRouter.delete("/:id",
  authMiddleware([UserRoleEnum.ADMIN, UserRoleEnum.HR]),
  documentsController.deleteDocument
);

export { documentsRouter };
