import { Knex } from "knex";
import { TaskStatusEnum, TaskPriorityEnum } from "../commons/enums/enums";
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {

  await knex("tasks_assignees_employees").del();
  await knex("tasks").del();

  const employees = await knex("employees").select("*");

  if (employees.length === 0) {
    return;
  }

  const managers = await knex("employees")
    .join("users", "employees.userId", "users.id")
    .where("users.role", "IN", ["admin", "manager"])
    .select("employees.*");

  const creators = managers.length > 0 ? managers : employees.slice(0, 5); 

  const tasks = [];
  const taskTitles = [
    "Разработка API для модуля сотрудников",
    "Обновление дизайн системы",
    "Настройка CI/CD pipeline",
    "Оптимизация производительности базы данных",
    "Создание документации проекта",
    "Исправление критических багов",
    "Разработка мобильного приложения",
    "Интеграция с внешними сервисами",
    "Проведение code review",
    "Настройка мониторинга системы",
    "Обновление зависимостей проекта",
    "Разработка системы уведомлений",
    "Оптимизация фронтенд компонентов",
    "Настройка автоматического тестирования",
    "Разработка админ панели",
    "Миграция данных",
    "Создание backup системы",
    "Оптимизация SEO",
    "Разработка API документации",
    "Настройка кеширования",
    "Реорганизация структуры проекта",
    "Создание landing page",
    "Интеграция платежной системы",
    "Разработка системы отчетов",
    "Настройка безопасности"
  ];

  const descriptions = [
    "Необходимо создать полноценный REST API с CRUD операциями",
    "Обновить компоненты в соответствии с новыми требованиями дизайна",
    "Настроить автоматическое развертывание для разных сред",
    "Провести анализ и оптимизацию запросов к базе данных",
    "Создать подробную техническую документацию проекта",
    "Устранить выявленные критические ошибки в системе",
    "Разработать мобильную версию приложения",
    "Настроить интеграцию с третьими сторонами",
    "Провести ревью кода для повышения качества",
    "Настроить систему мониторинга и алертов"
  ];

  for (let i = 0; i < 25; i++) {
    const creator = creators[i % creators.length];
    const title = taskTitles[i % taskTitles.length];
    const description = descriptions[i % descriptions.length];

    tasks.push({
      title: title,
      description: description,
      status: Object.values(TaskStatusEnum)[Math.floor(Math.random() * Object.values(TaskStatusEnum).length)],
      priority: Object.values(TaskPriorityEnum)[Math.floor(Math.random() * Object.values(TaskPriorityEnum).length)],
      deadline: faker.date.future({ years: 0.5 }), // Дедлайн в течение 6 месяцев
      creatorId: creator.id,
      attachments: Math.random() > 0.7 ? JSON.stringify([
        { name: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`, url: `/files/${title.toLowerCase().replace(/\s+/g, '_')}.pdf` }
      ]) : null
    });
  }
  
  await knex("tasks").insert(tasks).returning('*');
};
