import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Очищаем таблицу связей
  await knex("tasks_assignees_employees").del();

  console.log("Assigning tasks to employees...");

  // Получаем все задачи
  const tasks = await knex("tasks").select("*");

  // Получаем всех сотрудников
  const employees = await knex("employees").select("*");

  if (tasks.length === 0 || employees.length === 0) {
    console.log("No tasks or employees found. Please run previous seeds first.");
    return;
  }

  const taskAssignees = [];

  // Назначаем каждую задачу случайным сотрудникам (1-3 сотрудника на задачу)
  for (const task of tasks) {
    const assigneeCount = Math.floor(Math.random() * 3) + 1; // 1-3 исполнителя
    const shuffledEmployees = [...employees].sort(() => Math.random() - 0.5);

    for (let i = 0; i < assigneeCount && i < shuffledEmployees.length; i++) {
      taskAssignees.push({
        tasksId: task.id,
        employeesId: shuffledEmployees[i].id
      });
    }
  }

  // Вставляем связи между задачами и исполнителями
  await knex("tasks_assignees_employees").insert(taskAssignees).returning('*');

  console.log(`✅ Successfully assigned  task-employee relations`);
};
