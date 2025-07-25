import { InlineKeyboard } from "grammy";

export const requestKeyboard = new InlineKeyboard()
  .text("Создать заявку", "requests_create").row()
  .text("Просмореть заявки", "requests_view").row()
  .text("Найти заявки по ID", "requests_by_id").row()
  .text("Найти заявки по статусу", "requests_by_status").row()
  .text("Найти заявки по приоритету", "requests_by_priority").row();

export const requestHRKeyboard = requestKeyboard.clone()
  .text("Заявки сотрудника", "requests_by_employee").row();

export const tasksInlineKeyboard = new InlineKeyboard()
  .text("Список активных задач", "get_tasks").row()
  .text("Поиск по id", "search_by_id").row()
  .text("Поиск по статусу", "search_by_status").row()
  .text("Поиск по приоритету", "search_by_priority").row();

export const priorityKeyboard = new InlineKeyboard()
  .text("Критический", "critical").row()
  .text("Высокий", "high").row()
  .text("Средний", "medium").row()
  .text("Низкий", "low").row();

export const statusTaskKeyboard = new InlineKeyboard()
  .text("К выполнению", "todo").row()
  .text("В работе", "in_progress").row()
  .text("На проверке", "review").row()
  .text("Выполнено", "done").row()
  .text("Отменено", "canceled").row();

export const statusRequestKeyboard = new InlineKeyboard()
  .text("На рассмотрении", "pending").row()
  .text("Одобрено", "approved").row()
  .text("Отклонено", "rejected").row()
  .text("Выполнено", "completed").row()
  .text("Отменено", "cancelled").row();

export const requestTypeKeyboard = new InlineKeyboard()
  .text("Запрос документа", "document").row()
  .text("Запрос справки", "certificate").row()
  .text("Отпуск", "leave_vacation").row()
  .text("Неоплачиваемый отпуск", "leave_personal").row()
  .text("Больничный", "leave_sick").row();