import type { Knex } from "knex";
import { RequestStatusEnum, RequestTypeEnum, TaskPriorityEnum, TaskStatusEnum, UserRoleEnum } from "../commons/enums/enums";


export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("password").notNullable();
    table.string("email").notNullable().unique();
    table.enum("role", Object.values(UserRoleEnum)).defaultTo(UserRoleEnum.EMPLOYEE);
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
    table.jsonb('attachments').nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('requests', (table) => {
    table.increments('id').primary();
    table.enum('type', Object.values(RequestTypeEnum)).defaultTo(RequestTypeEnum.LEAVE_VACATION);
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
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks_assignees_employees');
  await knex.schema.dropTableIfExists('requests');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('employees');
  await knex.schema.dropTableIfExists('positions');
  await knex.schema.dropTableIfExists('departments');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}

