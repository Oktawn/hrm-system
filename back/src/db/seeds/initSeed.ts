import knex from "knex";
import { departments } from "../mocks/departments-mocks";
import { positions } from "../mocks/positions-mocks";
import { employees, employeeRoles } from "../mocks/employees-mocks";
import { users } from "../mocks/users-mocks";
import { requests } from "../mocks/requests-mocks";
import { tasks } from "../mocks/tasks-mocks";
import { assignments } from "../mocks/assignments-mocks";
import { faker } from '@faker-js/faker';
import { DocumentStatusEnum, DocumentTypeEnum, RequestTypeEnum, UserRoleEnum } from "../../commons/enums/enums";

// Функция для генерации документов на основе заявок

export async function seed(knex: knex.Knex): Promise<void> {
  console.log("Clearing all tables...");

  await knex("documents").del();
  await knex("comments").del();
  await knex("tasks_assignees_employees").del();
  await knex("requests").del();
  await knex("tasks").del();
  await knex("employees").del();
  await knex("positions").del();
  await knex("departments").del();
  await knex("refresh_tokens").del();
  await knex("users").del();

  console.log("Generating departments and positions...");
  await knex("departments").insert(departments);
  await knex("positions").insert(positions);

  console.log("Generating users and employees...");
  await knex("users").insert(users);
  await knex("employees").insert(employees);

  console.log("Updating employee assigned managers...");
  for (const assignment of assignments) {
    await knex("employees")
      .where("id", assignment.employeeId)
      .update({ assignedManagerId: assignment.assignedManagerId });
  }

  console.log("Generating requests and tasks...");
  const insertedRequests = await knex("requests").insert(requests).returning(['id']);

  // Вставляем задачи без поля assigneeIds (оно используется только для генерации связей)
  const tasksForInsert = tasks.map(task => {
    const { assigneeIds, ...taskWithoutAssigneeIds } = task;
    return taskWithoutAssigneeIds;
  });
  const insertedTasks = await knex("tasks").insert(tasksForInsert).returning(['id']);

  console.log("Generating task assignments...");
  // Генерируем назначения задач (many-to-many)
  const taskAssignments = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const insertedTask = insertedTasks[i];

    if (task.assigneeIds && task.assigneeIds.length > 0) {
      for (const assigneeId of task.assigneeIds) {
        taskAssignments.push({
          tasksId: insertedTask.id,
          employeesId: assigneeId
        });
      }
    }
  }
  if (taskAssignments.length > 0) {
    await knex("tasks_assignees_employees").insert(taskAssignments);
  } console.log("Generating documents...");
  const documents = generateDocuments(insertedRequests, requests);
  if (documents.length > 0) {
    await knex("documents").insert(documents);
    console.log(`Generated ${documents.length} documents`);
  } else {
    console.log("No documents to generate");
  }

  console.log("Database seeding completed successfully!");
}

const generateDocuments = (insertedRequests: any[], requests: any[]) => {
  const documents = [];

  // Получаем HR и админов для создания документов
  const hrAndAdmins = employees.filter(emp => {
    const role = employeeRoles.get(emp.userId);
    return role === UserRoleEnum.HR || role === UserRoleEnum.ADMIN;
  });

  // Получаем руководителей для подписания документов
  const heads = employees.filter(emp => {
    const role = employeeRoles.get(emp.userId);
    return role === UserRoleEnum.HEAD || role === UserRoleEnum.ADMIN;
  });

  // Фильтруем заявки - создаем документы только для заявок на документы и справки
  const eligibleRequestsWithIndexes = requests
    .map((request, index) => ({ request, index }))
    .filter(({ request }) =>
      request.type === RequestTypeEnum.DOCUMENT ||
      request.type === RequestTypeEnum.CERTIFICATE
    );

  // Создаем документы для ~70% подходящих заявок
  const documentsToCreate = Math.floor(eligibleRequestsWithIndexes.length * 0.7);
  const selectedRequests = faker.helpers.shuffle(eligibleRequestsWithIndexes).slice(0, documentsToCreate);

  selectedRequests.forEach(({ request, index }) => {
    const insertedRequest = insertedRequests[index];

    if (!insertedRequest) return;

    const creator = hrAndAdmins.length > 0 ? faker.helpers.arrayElement(hrAndAdmins) : null;
    const signer = heads.length > 0 ? faker.helpers.arrayElement(heads) : null;

    const documentType = request.type === RequestTypeEnum.DOCUMENT ?
      DocumentTypeEnum.EMPLOYMENT_CERTIFICATE : DocumentTypeEnum.WORK_CERTIFICATE;

    const status = faker.helpers.arrayElement([
      DocumentStatusEnum.UNDER_REVIEW,
      DocumentStatusEnum.SIGNED,
      DocumentStatusEnum.REJECTED
    ]);

    const createdAt = faker.date.between({
      from: request.createdAt,
      to: new Date(request.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 дней
    });

    const requestCreator = employees.find(emp => emp.id === request.creatorId);

    documents.push({
      type: documentType,
      title: request.title,
      description: request.description,
      status: status,
      content: null,
      templatePath: `/templates/${documentType.toLowerCase()}.docx`,
      filePath: status === DocumentStatusEnum.SIGNED ? `/documents/${insertedRequest.id}_${documentType}.pdf` : null,
      fileUrl: status === DocumentStatusEnum.SIGNED ? `/api/documents/${insertedRequest.id}/download` : null,
      sourceRequestId: insertedRequest.id,
      requestedById: request.creatorId,
      createdById: creator ? creator.id : null,
      signedById: status === DocumentStatusEnum.SIGNED ? (signer ? signer.id : null) : null,
      signedAt: status === DocumentStatusEnum.SIGNED ? faker.date.between({ from: createdAt, to: new Date() }) : null,
      rejectionReason: status === DocumentStatusEnum.REJECTED ? faker.helpers.arrayElement([
        'Недостаточно данных для формирования документа',
        'Требуется дополнительное согласование',
        'Не соответствует требованиям'
      ]) : null,
      templateData: {
        employeeName: `${requestCreator?.firstName} ${requestCreator?.lastName}`,
        employeePosition: 'Сотрудник',
        employeeDepartment: 'Отдел',
        hireDate: requestCreator?.hireDate,
        requestDate: request.createdAt
      },
      metadata: {
        generatedBy: 'system',
        requestType: request.type
      },
      createdAt: createdAt,
      updatedAt: createdAt
    });
  });

  return documents;
};
