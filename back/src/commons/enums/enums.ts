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

export enum DocumentStatusEnum {
  UNDER_REVIEW = "under_review",  // На рассмотрении
  SIGNED = "signed",              // Подписан
  REJECTED = "rejected",          // Отказано
  EXPIRED = "expired",           // Истёк срок
  DRAFT = "draft"                // Черновик
}

export enum DocumentTypeEnum {
  WORK_CERTIFICATE = "work_certificate",           // Справка с места работы
  SALARY_CERTIFICATE = "salary_certificate",      // Справка о доходах
  EMPLOYMENT_CERTIFICATE = "employment_certificate", // Справка о трудоустройстве
  VACATION_CERTIFICATE = "vacation_certificate",  // Справка об отпуске
  MEDICAL_CERTIFICATE = "medical_certificate",    // Медицинская справка
  PERSONAL_DATA_EXTRACT = "personal_data_extract", // Выписка из личного дела
  CONTRACT_COPY = "contract_copy",                 // Копия трудового договора
  OTHER = "other"                                  // Другое
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