export enum UserRoleEnum {
  ADMIN = "admin",
  HR = "hr",
  MANAGER = "manager",
  EMPLOYEE = "employee"
}

export enum RequestStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum RequestTypeEnum {
  DOCUMENT = "document",       // Запрос документа
  CERTIFICATE = "certificate", // Запрос справки
  LEAVE_VACATION = "leave_vacation", // Отпуск
  LEAVE_SICK = "leave_sick",   // Больничный
  LEAVE_PERSONAL = "leave_personal", // Отгул
  // другие типы заявок
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