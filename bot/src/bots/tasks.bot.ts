import { Composer, InlineKeyboard } from "grammy";
import { TaskComposerConversation, TaskContext, TaskConversation } from "../commons/context.types";
import { TasksService } from "../services/tasks.service";
import { createConversation } from "@grammyjs/conversations";
import { Assignee, DataTask, Task } from "../commons/types";
import dedent from "dedent";
import { TaskPriorityEnum, TaskStatusEnum } from "../commons/enums";
import { getPriorityText, getTaskStatusText } from "../commons/status.util";
import { envConfig } from "../config/config";
import { TaskDataSession } from "../commons/session.type";
import { priorityKeyboard, statusTaskKeyboard, tasksInlineKeyboard } from "./keyboards.bot";


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

async function getTasks(ctx: TaskContext) {
  try {
    const dateTask: DataTask = {
      tgID: ctx.from.id
    };
    const dataTask: TaskDataSession = {
      currentPage: 0,
      totalPages: Math.ceil((await tasksService.getActiveTasks(dateTask) || []).length / 10),
      tasks: await tasksService.getActiveTasks(dateTask) || []
    }
    ctx.session.tasks = dataTask;
    await ctx.reply("Ваши активные задачи:", {
      reply_markup: listTask(dataTask),
    });
  } catch (error) {
    ctx.reply(String(error));
  }
  return;
};

function listTask(tasks: TaskDataSession) {
  const tasksOnPage = 10;
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

export function showEmployee(employee: Assignee) {
  return `${employee.firstName} ${employee.lastName}`;
}

function showTask(task: Task) {
  const url = `${envConfig.get("ORIGIN_FRONTEND")}/tasks?task=${task.id}`;
  const msg = dedent`
    Задача: ${task.id}
    Название: ${task.title || '-'}
    Описание: ${task.description || '-'}
    Создатель: ${showEmployee(task.creator) || '-'}
    Исполнители: ${task.assignees && task.assignees.length > 0 ? task.assignees.map(showEmployee).join(", ") : '-'}
    Статус: ${getTaskStatusText(task.status) || '-'}
    Приоритет: ${getPriorityText(task.priority) || '-'}
    URL: [внешняя ссылка](${url})`;
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
    ctx.reply("Произошла ошибка при получении задачи.");
  }
  return;
};

async function getTasksByStatus(conv: TaskConversation, ctx: TaskContext) {

  await ctx.reply("Выберите статус задачи", {
    reply_markup: statusTaskKeyboard
  });
  const ans = await conv.waitForCallbackQuery(Object.values(TaskStatusEnum) as string[]);
  try {
    const result = await tasksService.getTasksByStatus({
      tgID: ctx.from.id,
      status: ans.callbackQuery.data
    });
    const dataTask: TaskDataSession = {
      currentPage: 0,
      totalPages: Math.ceil((Array.isArray(result) ? result.length : 1) / 10),
      tasks: Array.isArray(result) ? result : [result]
    }
    await conv.external((ctx) => {
      ctx.session.tasks = dataTask;
    });
    if (dataTask.tasks.length === 0) {
      await ctx.reply("Задач с таким статусом не найдено.");
    } else {
      await ctx.reply(`Задачи со статусом "${getTaskStatusText(ans.callbackQuery.data)}": `, {
        reply_markup: listTask(dataTask),
      });
    }
  } catch (error) {
    ctx.reply("Произошла ошибка при получении задач.");
  }
  return;
};

async function getTasksByPriority(conv: TaskConversation, ctx: TaskContext) {


  await ctx.reply("Выберите приоритет задачи", {
    reply_markup: priorityKeyboard
  });
  const ans = await conv.waitForCallbackQuery(Object.values(TaskPriorityEnum) as string[]);
  try {
    const result = await tasksService.getTasksByPriority({
      tgID: ctx.from.id,
      priority: ans.callbackQuery.data
    });

    const dataTask: TaskDataSession = {
      currentPage: 0,
      totalPages: Math.ceil((Array.isArray(result) ? result.length : 1) / 10),
      tasks: Array.isArray(result) ? result : [result]
    };
    await conv.external((ctx) => {
      ctx.session.tasks = dataTask;
    });
    if (dataTask.tasks.length === 0) {
      await ctx.reply("Задач с таким приоритетом не найдено.");
    } else {
      await ctx.reply(`Задачи с приоритетом "${getPriorityText(ans.callbackQuery.data)}": `, {
        reply_markup: listTask(dataTask),
      });
    }
  } catch (error) {
    await ctx.reply("Произошла ошибка при получении задач.");
  }
  return;
}


tasksComposer.use(createConversation(getTaskById));
tasksComposer.use(createConversation(getTasksByStatus));
tasksComposer.use(createConversation(getTasksByPriority));

tasksComposer.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;

  switch (data) {
    case "tasks_start":
      await ctx.reply("Добро пожаловать в управление задачами!", {
        reply_markup: tasksInlineKeyboard,
      });
      break;
    case "get_tasks":
      await getTasks(ctx);
      break;
    case "search_by_id":
      await ctx.conversation.enter("getTaskById");
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
        reply_markup: listTask(ctx.session.tasks)
      });
      break;
    case "tasks_next_page":
      if (ctx.session.tasks.currentPage < ctx.session.tasks.totalPages - 1) {
        ctx.session.tasks.currentPage++;
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: listTask(ctx.session.tasks)
      });
      break;
    default:
      if (data.startsWith("view_task_")) {
        const taskId = data.replace("view_task_", "");
        await ctx.reply(showTask(await tasksService.getTaskById({
          tgID: ctx.from.id,
          id: parseInt(taskId)
        })), {
          parse_mode: "MarkdownV2",
        });
      }
      break;
  }

  await next();
});