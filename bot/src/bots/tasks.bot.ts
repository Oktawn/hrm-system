import { Composer, InlineKeyboard } from "grammy";
import { TaskComposerConversation, TaskContext, TaskConversation } from "../commons/context.types";
import { TasksService } from "../services/tasks.service";
import { createConversation } from "@grammyjs/conversations";
import { DataTask, Task } from "../commons/types";
import dedent from "dedent";
import { TaskPriorityEnum, TaskStatusEnum } from "../commons/enums";
import { getPriorityText, getTaskStatusText } from "../commons/status.util";
import { envConfig } from "../config/config";


export const tasksComposer = new Composer<TaskComposerConversation>();
const tasksService = new TasksService();

tasksComposer.use(async (ctx, next) => {
  if (!ctx.session.tasks) {
    ctx.session.tasks = {
      currentPage: 0,
      totalPages: 0,
      tasks: []
    }
  }
  await next();
})

const tasksInlineKeyboard = new InlineKeyboard()
  .text("Список активных задач", "get_tasks").row()
  .text("Поиск по id", "search_by_id").row()
  .text("Поиск по статусу", "search_by_status").row()
  .text("Поиск по приоритету", "search_by_priority").row()

async function getTasks(_: TaskConversation, ctx: TaskContext) {
  try {
    ctx.session.tasks.currentPage = 0;
    console.log("getTasks called");
    const dateTask: DataTask = {
      tgID: ctx.from.id
    };
    ctx.session.tasks.tasks = await tasksService.getActiveTasks(dateTask) || [];
    ctx.session.tasks.totalPages = ctx.session.tasks.tasks.length;
    await ctx.reply("Ваши активные задачи:", {
      reply_markup: listTask(ctx),
    });
  } catch (error) {
    await ctx.reply("Произошла ошибка при получении задач.");
  }
};
tasksComposer.use(createConversation(getTasks));

function listTask(ctx: TaskContext) {
  const tasksOnPage = 10;
  const { tasks } = ctx.session;
  const currentPage = tasks.currentPage || 0;

  const startIndex = currentPage * tasksOnPage;
  const endIndex = startIndex + tasksOnPage;
  const tasksForPage = tasks.tasks.slice(startIndex, endIndex);

  const taskKeyboard = new InlineKeyboard();

  tasksForPage.forEach((task, index) => {
    if (index % 2 === 0) {
      taskKeyboard.text(`${task.title}`, `view_task_${task.id}`).row();
    } else {
      taskKeyboard.text(`${task.title}`, `view_task_${task.id}`);
    }
  });

  taskKeyboard.row();
  const totalPages = Math.ceil(tasks.tasks.length / tasksOnPage);

  if (currentPage > 0) {
    taskKeyboard.text("⬅️ Назад", `tasks_prev_page`);
  }
  if (currentPage < totalPages - 1) {
    taskKeyboard.text("Вперёд ➡️", `tasks_next_page`);
  }

  return taskKeyboard;
}

function showTask(task: Task) {
  const url = `${envConfig.get("ORIGIN_FRONTEND")}/tasks?task=${task.id}`;
  const msg = `Задача: ${String(task.id)}\n` +
    `Название: ${task.title || '-'}\n` +
    `Описание: ${task.description || '-'}\n` +
    `Статус: ${getTaskStatusText(task.status) || '-'}\n` +
    `Приоритет: ${getPriorityText(task.priority) || '-'}\n` +
    `URL: [внешняя ссылка](${url})\n`;
  return msg;
}

async function getTaskById(conv: TaskConversation, ctx: TaskContext) {
  await ctx.reply("Введите ID задачи для просмотра:");
  const taskId = (await conv.waitFor("message:text")).message.text.trim();

  if (!taskId) {
    await ctx.reply("Пожалуйста, укажите ID задачи.");
    return;
  }
  try {
    const dataTask: DataTask = {
      tgID: ctx.from.id,
      id: parseInt(taskId)
    };
    const task = await tasksService.getTaskById(dataTask);
    if (task) {
      let msg = showTask(task);
      await ctx.reply(msg, {
        parse_mode: "MarkdownV2",
      });
    } else {
      await ctx.reply("Задача не найдена.");
    }
  } catch (error) {
    ctx.reply(String(error));
  }
};
tasksComposer.use(createConversation(getTaskById));

async function getTasksByStatus(conv: TaskConversation, ctx: TaskContext) {

  const StatusKeyboard = new InlineKeyboard()
    .text("К выполнению", "todo").row()
    .text("В работе", "in_progress").row()
    .text("На проверке", "review").row()
    .text("Выполнено", "done").row()
    .text("Отменено", "canceled").row();
  await ctx.reply("Выберите статус задачи", {
    reply_markup: StatusKeyboard
  });
  const ans = await conv.waitForCallbackQuery(Object.values(TaskStatusEnum) as string[]);
  try {
    const result = await tasksService.getTasksByStatus({
      tgID: ctx.from.id,
      status: ans.callbackQuery.data
    });

    ctx.session.tasks.currentPage = 0;
    ctx.session.tasks.tasks = Array.isArray(result) ? result : [result];

    if (ctx.session.tasks.tasks.length === 0) {
      await ctx.reply("Задач с таким статусом не найдено.");
    } else {
      await ctx.reply(`Задачи со статусом "${ans.callbackQuery.data}": `, {
        reply_markup: listTask(ctx),
      });
    }
  } catch (error) {
    await ctx.reply("Произошла ошибка при получении задач.");
  }
};
tasksComposer.use(createConversation(getTasksByStatus));

async function getTasksByPriority(conv: TaskConversation, ctx: TaskContext) {

  const PriorityKeyboard = new InlineKeyboard()
    .text("Критический", "critical").row()
    .text("Высокий", "high").row()
    .text("Средний", "medium").row()
    .text("Низкий", "low").row();

  await ctx.reply("Выберите приоритет задачи", {
    reply_markup: PriorityKeyboard
  });
  const ans = await conv.waitForCallbackQuery(Object.values(TaskPriorityEnum) as string[]);
  try {
    const result = await tasksService.getTasksByPriority({
      tgID: ctx.from.id,
      priority: ans.callbackQuery.data
    });

    ctx.session.tasks.currentPage = 0;
    ctx.session.tasks.tasks = Array.isArray(result) ? result : [result];

    if (ctx.session.tasks.tasks.length === 0) {
      await ctx.reply("Задач с таким приоритетом не найдено.");
    } else {
      await ctx.reply(`Задачи с приоритетом "${ans.callbackQuery.data}": `, {
        reply_markup: listTask(ctx),
      });
    }
  } catch (error) {
    await ctx.reply("Произошла ошибка при получении задач.");
  }
}
tasksComposer.use(createConversation(getTasksByPriority));

tasksComposer.command("start", async (ctx, next) => {
  await ctx.reply("Добро пожаловать в управление задачами!", {
    reply_markup: tasksInlineKeyboard,
  });
  await next();
})

tasksComposer.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;

  switch (data) {
    case "tasks_start":
      await ctx.reply("Добро пожаловать в управление задачами!", {
        reply_markup: tasksInlineKeyboard,
      });
      break;
    case "get_tasks":
      await ctx.conversation.enter("getTasks");
      break;
    case "search_by_id":
      await ctx.conversation.enter("getTaskById");
      break;
    case "view_task":
      await ctx.reply("Функция просмотра задачи еще не реализована.");
      break;
    case "search_by_status":
      await ctx.conversation.enter("getTasksByStatus");
      break;
    case "search_by_priority":
      await ctx.conversation.enter("getTasksByPriority");
      break;
    case "tasks_prev_page":
      if (ctx.session.tasks.currentPage > 0) {
        ctx.session.tasks.currentPage--;
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: listTask(ctx)
      });
      break;
    case "tasks_next_page":
      if (ctx.session.tasks.currentPage < ctx.session.tasks.totalPages - 1) {
        ctx.session.tasks.currentPage++;
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: listTask(ctx)
      });
      break;
    default:
      if (data.startsWith("view_task_")) {
        const taskId = data.replace("view_task_", "");
        await ctx.reply(`Просмотр задачи #${taskId} еще не реализован.`);
      } else {
        await ctx.reply("Неизвестная команда.");
      }
      break;
  }

  await next();
});