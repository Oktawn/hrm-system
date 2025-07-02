import type { Knex } from "knex";
import { DocumentStatusEnum, DocumentTypeEnum, RequestStatusEnum, RequestTypeEnum, TaskPriorityEnum, TaskStatusEnum, UserRoleEnum } from "../commons/enums/enums";


export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("password").notNullable();
    table.string("email").notNullable().unique();
    table.enum("role", Object.values(UserRoleEnum)).defaultTo(UserRoleEnum.EMPLOYEE);
    table.boolean("isActive").defaultTo(true);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });


  await knex.schema.createTable('refresh_tokens', (table) => {
    table.string('tokens').primary();
    table.uuid('userId').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.date('expires_at').notNullable();
  });

  await knex.schema.createTable('departments', (table) => {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('positions', (table) => {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.string('description').nullable();
    table.decimal('baseSalary', 10, 2).nullable();
    table.string('grade').nullable();
    table.integer('departmentId').nullable().references('id').inTable('departments').onDelete('SET NULL');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("employees", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string('firstName').nullable();
    table.string('lastName').nullable();
    table.string('middleName').nullable();
    table.date('birthDate').nullable();
    table.date('hireDate').nullable();
    table.string('phone').nullable();
    table.integer("tgID").nullable().unique();
    table.uuid('assignedManagerId').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.uuid('userId').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.integer('departmentId').nullable().references('id').inTable('departments').onDelete('SET NULL');
    table.integer('positionId').nullable().references('id').inTable('positions').onDelete('SET NULL');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description').nullable();
    table.enum("status", Object.values(TaskStatusEnum)).defaultTo(TaskStatusEnum.TODO);
    table.enum('priority', Object.values(TaskPriorityEnum)).defaultTo(TaskPriorityEnum.MEDIUM);
    table.date('deadline').nullable();
    table.uuid('creatorId').references('id').inTable('employees').onDelete('SET NULL');
    table.uuid('assigneeId').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.jsonb('attachments').nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('requests', (table) => {
    table.increments('id').primary();
    table.enum('type', Object.values(RequestTypeEnum)).defaultTo(RequestTypeEnum.LEAVE_VACATION);
    table.enum('priority', Object.values(TaskPriorityEnum)).defaultTo(TaskPriorityEnum.MEDIUM);
    table.enum('status', Object.values(RequestStatusEnum)).defaultTo(RequestStatusEnum.PENDING);
    table.string('title').notNullable();
    table.text('description').nullable();
    table.uuid('creatorId').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('assigneeId').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.date('startDate').nullable();
    table.date('endDate').nullable();
    table.integer('duration').nullable();
    table.jsonb('attachments').nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('tasks_assignees_employees', (table) => {
    table.increments('id').primary();
    table.integer('tasksId').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.uuid('employeesId').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.unique(['tasksId', 'employeesId']);
  });

  await knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.enum('type', ['task', 'request']).defaultTo('task');
    table.integer('taskId').nullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.integer('requestId').nullable().references('id').inTable('requests').onDelete('CASCADE');
    table.uuid('authorId').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.jsonb('attachments').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('documents', (table) => {
    table.increments('id').primary();
    table.enum('type', Object.values(DocumentTypeEnum)).notNullable();
    table.string('title').notNullable();
    table.text('description').nullable();
    table.enum('status', Object.values(DocumentStatusEnum)).defaultTo('under_review');
    table.text('content').nullable();
    table.string('templatePath').nullable(); // Путь к шаблону документа
    table.string('filePath').nullable(); // Путь к сгенерированному файлу
    table.string('fileUrl').nullable(); // URL для доступа к документу

    table.integer('sourceRequestId').unsigned().references('id').inTable('requests').onDelete('CASCADE');
    table.uuid('requestedById').references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('createdById').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.uuid('signedById').nullable().references('id').inTable('employees').onDelete('SET NULL');

    table.timestamp('signedAt').nullable();
    table.text('rejectionReason').nullable();
    table.jsonb('templateData').nullable(); // Данные для заполнения шаблона
    table.jsonb('metadata').nullable();

    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Индексы для улучшения производительности
    table.index(['type']);
    table.index(['status']);
    table.index(['requestedById']);
    table.index(['createdById']);
    table.index(['sourceRequestId']);
    table.index(['createdAt']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('documents');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('tasks_assignees_employees');
  await knex.schema.dropTableIfExists('requests');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('employees');
  await knex.schema.dropTableIfExists('positions');
  await knex.schema.dropTableIfExists('departments');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}

