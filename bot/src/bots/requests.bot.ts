import { createConversation } from "@grammyjs/conversations";
import { Composer, InlineKeyboard } from "grammy";
import { RequestComposerConversation, RequestContext, RequestConversation } from "../commons/context.types";
import { TaskPriorityEnum, UserRoleEnum } from "../commons/enums";
import { RequestsService } from "../services/requests.service";
import { RequestType } from "../commons/types";
import { envConfig } from "../config/config";
import { PriorityKeyboard, showEmployee } from "./tasks.bot";
import { getPriorityText, getRequestStatusText, getRequestTypeText } from "../commons/status.util";
import dedent from "dedent";

export const requestsComposer = new Composer<RequestComposerConversation>();
const requestsService = new RequestsService();

requestsComposer.use(async (ctx, next) => {
  if (!ctx.session.requests) {
    ctx.session.requests = {
      currentPage: 0,
      totalPages: 0,
      requests: []
    }
  }
  await next();
});

const dataOnPage = 10;
const requestKeyboard = new InlineKeyboard()
  .text("Создать запрос", "requests_create").row()
  .text("Просмореть заявки", "requests_view").row()
  .text("Найти заявки по ID", "requests_find").row()
  .text("Найти заявки по статусу", "requests_find_status").row()
  .text("Найти заявки по приоритету", "requests_find_priority").row()
  .text("Добавить комментарий", "requests_add_comment").row();

const requestHRKeyboard = requestKeyboard.clone()
  .text("Заявки сотрудника", "requests_find_employee").row()
  .text("Заявки отдела", "requests_find_department").row()
  .text("Изменить статус заявки", "requests_change_status").row()
  .text("Выгрузка в Excel", "requests_export_excel").row();

function listRequests(ctx: RequestContext) {
  const { requests, totalPages, currentPage } = ctx.session.requests;

  const startIndex = currentPage * dataOnPage;
  const endIndex = startIndex + dataOnPage;
  const requestsForPage = requests.slice(startIndex, endIndex);

  const requestsKeyboard = new InlineKeyboard();

  requestsForPage.forEach((request, index) => {
    if (index % 2 === 0) {
      requestsKeyboard.text(`${request.title}`, `view_request_${request.id}`).row();
    } else {
      requestsKeyboard.text(`${request.title}`, `view_request_${request.id}`);
    }
  });

  requestsKeyboard.row();
  if (currentPage > 0) {
    requestsKeyboard.text("Назад", "requests_prev").row();
  }
  if (currentPage < totalPages - 1) {
    requestsKeyboard.text("Вперед", "requests_next").row();
  }

  return requestsKeyboard;
}



function showRequests(request: RequestType) {
  const url = `${envConfig.get("ORIGIN_FRONTEND")}/requests?request=${request.id}`;
  const msg = dedent`
    Задача: ${request.id}
    Название: ${request.title || '-'}
    Описание: ${request.description || '-'}
    Тип: ${getRequestTypeText(request.type) || '-'}
    Создатель: ${showEmployee(request.creator) || '-'}
    Исполнитель: ${showEmployee(request.assignee) || '-'}
    Статус: ${getRequestStatusText(request.status) || '-'}
    Приоритет: ${getPriorityText(request.priority) || '-'}
    URL: [внешняя ссылка](${url})`;
  return msg;
}

async function getRequests(conv: RequestConversation, ctx: RequestContext) {
  await ctx.reply("Получение заявок...");
  try {
    const requests = await requestsService.getRequests({
      tgID: ctx.from.id
    });
    await conv.external((ctx) => {
      ctx.session.requests.requests = requests;
    });
    if (requests.length === 0) {
      await ctx.reply("Заявок не найдено.");
    } else {
      await ctx.reply("Ваши заявки:", {
        reply_markup: listRequests(ctx)
      });
    }
  } catch (error) {
    await ctx.reply(`Ошибка при получении заявок: ${error.message}`);
  }
  return;
}


async function createRequest(conv: RequestConversation, ctx: RequestContext) {
  await ctx.reply("Введите название заявки:");
  const title = await conv.waitFor("message:text");
  await ctx.reply("Введите описание заявки:");
  const description = await conv.waitFor("message:text");
  await ctx.reply("Выберите приоритет заявки:", {
    reply_markup: PriorityKeyboard
  });
  const priority = await conv.waitForCallbackQuery(Object.values(TaskPriorityEnum) as string[]);
  try {
    const request = await requestsService.createRequest({
      tgID: ctx.from.id,
      request: {
        title: title.message.text.trim(),
        description: description.message.text.trim(),
        priority: priority.callbackQuery.data,
        type: "",
        status: ""
      }
    });
    await ctx.reply("Заявка успешно создана.");
  } catch (error) {
    await ctx.reply(`Ошибка при создании заявки: ${error.message}`);
  }
  return;
}

async function findEmployeeRequests(conv: RequestConversation, ctx: RequestContext) {
  await ctx.reply("Введите ФИО сотрудника для поиска заявок:");
  const employeeName = await conv.waitFor("message:text");
  await ctx.reply(`Поиск заявок сотрудника: ${employeeName}`);
  try {
    const requests = await requestsService.getEmployeeRequests({
      tgID: ctx.from.id,
      employeeName: employeeName.message.text.trim()
    });
    await conv.external((ctx) => {
      ctx.session.requests.requests = requests;
      ctx.session.requests.currentPage = 0;
      ctx.session.requests.totalPages = Math.round(requests.length / dataOnPage);
    });
    if (requests.length === 0) {
      await ctx.reply("Заявки не найдены.");
    }
    else {
      await ctx.reply("Заявки сотрудника:", {
        reply_markup: listRequests(ctx)
      });
    }
  } catch (error) {
    await ctx.reply(`Ошибка при получении заявок: ${error.message}`);
  }
  return;
}

async function getRequestsByPriority(conv: RequestConversation, ctx: RequestContext) {
  await ctx.reply("Выберите приоритет задачи", {
    reply_markup: PriorityKeyboard
  });
  const ans = await conv.waitForCallbackQuery(
    Object.values(TaskPriorityEnum) as string[]
  );
  try {
    const result = await requestsService.getRequestsByPriority({
      tgID: ctx.from.id,
      priority: ans.callbackQuery.data
    });
    await conv.external((ctx) => {
      ctx.session.requests.requests = result;
      ctx.session.requests.currentPage = 0;
      ctx.session.requests.totalPages = Math.round(result.length / dataOnPage);
    });
    if (result.length === 0) {
      await ctx.reply("Заявок с таким приоритетом не найдено.");
    }
    else {
      await ctx.reply(`Заявки с приоритетом "${getPriorityText(ans.callbackQuery.data)}": `, {
        reply_markup: listRequests(ctx),
      });
    }
  } catch (error) {
    await ctx.reply("Произошла ошибка при получении заявок.");
  }

  return;
}

requestsComposer.use(createConversation(getRequests));
requestsComposer.use(createConversation(createRequest));
requestsComposer.use(createConversation(findEmployeeRequests));
requestsComposer.use(createConversation(getRequestsByPriority));

requestsComposer.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;

  switch (data) {
    case "requests_start":
      if (ctx.session.user.Role === UserRoleEnum.EMPLOYEE) {
        await ctx.reply("Выберите действие:", {
          reply_markup: requestKeyboard,
        });
      }
      else {
        await ctx.reply("Выберите действие:", {
          reply_markup: requestHRKeyboard,
        });
      }
      break;
    case "requests_create":
      await ctx.reply("Создание запроса...");
      await ctx.conversation.enter("createRequest");
      break;
    case "findEmployeeRequests":
      await ctx.conversation.enter("findEmployeeRequests");
      break;
    case "getRequestsByPriority":
      await ctx.conversation.enter("getRequestsByPriority");
      break;
    case "requests_prev":
      if (ctx.session.requests.currentPage > 0) {
        ctx.session.requests.currentPage--;
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: listRequests(ctx)
      });
      break;
    case "requests_next":
      if (ctx.session.requests.currentPage < ctx.session.requests.totalPages - 1) {
        ctx.session.requests.currentPage++;
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: listRequests(ctx)
      });
      break;
    default:
      if (data.startsWith("view_request_")) {
        const requestId = data.replace("view_request_", "");
        await ctx.reply(showRequests(await requestsService.getRequestsById({
          tgID: ctx.from.id,
          id: parseInt(requestId)
        })), {
          parse_mode: "MarkdownV2",
        });
      } else {
        await ctx.reply("Неизвестная команда.");
      }
      break;
  }

  await next();
});