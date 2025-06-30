import { Composer, Context, InlineKeyboard } from "grammy";
import { TaskComposerConversation, TaskContext, TaskConversation } from "../commons/context.types";
import { TasksService } from "../services/tasks.service";
import { createConversation } from "@grammyjs/conversations";


export const tasksComposer = new Composer<TaskComposerConversation>();
const tasksService = new TasksService();

tasksComposer.use(async (ctx, next) => {
  if (!ctx.session.tasks) {
    ctx.session.tasks = {
      currentPage: 0,
      tasks: []
    }
  }
  await next();
})

const tasksInlineKeyboard = new InlineKeyboard()
  .text("Список задач", "get_tasks").row()
  .text("Просмотр задачи", "view_task").row()
  .text("Добавить комментарий к задаче", "add_comment").row();

async function getTasks(_: TaskConversation, ctx: TaskContext) {
  try {
    ctx.session.tasks.tasks = await tasksService.getAllTasks(ctx.from.id);
    ctx.session.tasks.currentPage = 0;
    await ctx.reply("Ваши активные задачи:", {
      reply_markup: listTask(ctx),
    });
  } catch (error) {
    await ctx.reply("Произошла ошибка при получении задач.");
  }
}

tasksComposer.use(createConversation(getTasks));

function listTask(ctx: TaskContext) {
  const tasksOnPage = 10;
  const { tasks } = ctx.session;
  const currentPage = tasks.currentPage || 0;

  const activeTasks = tasks.tasks.filter(task => task.status !== 'completed');

  // Вычисляем задачи для текущей страницы
  const startIndex = currentPage * tasksOnPage;
  const endIndex = startIndex + tasksOnPage;
  const tasksForPage = activeTasks.slice(startIndex, endIndex);

  const taskKeyboard = new InlineKeyboard();

  // Добавляем кнопки для задач на текущей странице
  tasksForPage.forEach((task, index) => {
    if (index % 2 === 0) {
      taskKeyboard.text(`${task.title}`, `view_task_${task.id}`).row();
    } else {
      taskKeyboard.text(`${task.title}`, `view_task_${task.id}`);
    }
  });

  // Добавляем кнопки пагинации
  taskKeyboard.row();
  const totalPages = Math.ceil(activeTasks.length / tasksOnPage);

  if (currentPage > 0) {
    taskKeyboard.text("⬅️ Назад", `tasks_prev_page`);
  }
  if (currentPage < totalPages - 1) {
    taskKeyboard.text("Вперёд ➡️", `tasks_next_page`);
  }

  return taskKeyboard;
}

tasksComposer.on("callback_query:data", async (ctx, next) => {
  const tasksOnPage = 10;
  const data = ctx.callbackQuery.data;

  if (data === "tasks_prev_page") {
    ctx.session.tasks.currentPage = Math.max(0, ctx.session.tasks.currentPage - 1);
    await ctx.editMessageReplyMarkup({ reply_markup: listTask(ctx) });
    await next();
    return;
  }

  if (data === "tasks_next_page") {
    const activeTasks = ctx.session.tasks.tasks.filter(task => task.status !== 'completed');
    const totalPages = Math.ceil(activeTasks.length / tasksOnPage);
    ctx.session.tasks.currentPage = Math.min(totalPages - 1, ctx.session.tasks.currentPage + 1);
    await ctx.editMessageReplyMarkup({ reply_markup: listTask(ctx) });
    await next();
    return;
  }

  switch (data) {
    case "tasks_start":
      await ctx.reply("Добро пожаловать в управление задачами!", {
        reply_markup: tasksInlineKeyboard,
      });
      break;
    case "get_tasks":
      ctx.session.tasks.currentPage = 0;
      ctx.session.tasks.tasks = await tasksService.getAllTasks(ctx.from?.id);
      await ctx.reply("Ваши активные задачи:", {
        reply_markup: listTask(ctx),
      });
      break;
    case "view_task":
      await ctx.reply("Функция просмотра задачи еще не реализована.");
      break;
    case "add_comment":
      await ctx.reply("Функция добавления комментария к задаче еще не реализована.");
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
})