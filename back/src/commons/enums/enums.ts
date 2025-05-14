export enum UserRoleEnum {
  ADMIN = "admin",
  HR = "hr",
  MANAGER = "manager",
  EMPLOYEE = "employee"
}

export enum RequestsStatusEnum {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled"
}

export enum RequestTypeEnum {
  DOCUMENT = "document",
  CERTIFICATE = "certificate",
  EQUIPMENT = "equipment",
  COMPENSATION = "compensation",
  BENEFITS = "benefits",
  OTHER = "other"
}

export enum LeaveTypeEnum {
  VACATION = "vacation",
  SICK = "sick",
  UNPAID = "unpaid",
  OTHER = "other"
}


export enum TaskStatusEnum {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  CANCELLED = "cancelled"
}

export enum TaskPriorityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}