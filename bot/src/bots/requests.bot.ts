import { createConversation } from "@grammyjs/conversations";
import { Composer, InlineKeyboard } from "grammy";
import { RequestComposerConversation, RequestContext, RequestConversation } from "../commons/context.types";
import { RequestTypeEnum, TaskPriorityEnum, UserRoleEnum } from "../commons/enums";
import { RequestsService } from "../services/requests.service";
import { CreateRequestType, RequestType } from "../commons/types";
import { envConfig } from "../config/config";
import { showEmployee } from "./tasks.bot";
import { getPriorityText, getRequestStatusText, getRequestTypeText } from "../commons/status.util";
import dedent from "dedent";
import { priorityKeyboard, requestHRKeyboard, requestKeyboard, requestTypeKeyboard } from "./keyboards.bot";
import dayjs from "dayjs";

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
  await ctx.reply(`Выберите тип заявки, которую хотите создать:`, {
    reply_markup: requestTypeKeyboard
  });

  const typeCallback = await conv.waitForCallbackQuery(Object.values(RequestTypeEnum));

  const selectedType = typeCallback.callbackQuery.data;

  switch (selectedType) {
    case "leave_vacation":
    case "leave_personal":
      await createLeaveRequest(conv, ctx);
      break;
    case "leave_sick":
      await createSickRequest(conv, ctx);
      break;
    case "document":
    case "certificate":
    case "business_trip":
      await ctx.reply("Функция создания данного типа заявок будет добавлена в следующих обновлениях.");
      break;
    default:
      await ctx.reply("Неизвестный тип заявки.");
  }

  return;
}

async function createLeaveRequest(conv: RequestConversation, ctx: RequestContext) {
  let newRequest: CreateRequestType = {
    type: ctx.callbackQuery.data,
    title: "",
    description: "",
    priority: ""
  }
  let msgsId = [];

  await ctx.reply(dedent`
    Создание заявки на отпуск.
    Для ее создания выполним несколько шагов.`
  );

  newRequest.title = getRequestTypeText(newRequest.type);

  if (newRequest.type === RequestTypeEnum.LEAVE_VACATION) {
    await ctx.reply(dedent`
      Укажите описание заявки на отпуск:`
    );
    newRequest.description = (await conv.waitFor("message:text")).message.text.trim();
  }

  await ctx.reply(dedent`
    Введите даты начала и конца отпуска в формате дд.мм.гггг-дд.мм.гггг:
    например, 20.07.2025-30.07.2025`
  );
  const date = (await conv.waitFor("message:text")).message.text.trim();
  const [startInput, endInput] = date.split("-");
  const isValid = validateLeaveDates(startInput, endInput);
  if (!isValid.valid) {
    await ctx.reply(isValid.msg);
    return;
  }
  newRequest.startDate = new Date(startInput);
  newRequest.endDate = new Date(endInput);
  msgsId.push((await ctx.reply("Выберите приоритет заявки:", {
    reply_markup: priorityKeyboard
  })).message_id);
  newRequest.priority = (await conv.waitForCallbackQuery(
    Object.values(TaskPriorityEnum)
  )).callbackQuery.data;

  try {
    await requestsService.createRequest({
      tgID: ctx.from.id,
      request: newRequest
    });
    await ctx.reply("Заявка на отпуск успешно создана!");
    await Promise.all(msgsId.map((id) =>
      ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
        reply_markup: new InlineKeyboard()
      })));
  } catch (error) {
    await ctx.reply(`Ошибка при создании заявки: ${error.message}`);
  }
  return;
}

async function createSickRequest(conv: RequestConversation, ctx: RequestContext) {
  let newRequest: CreateRequestType = {
    type: ctx.callbackQuery.data,
    title: "",
    description: "",
    priority: ""
  }
  let msgsId = [];

  await ctx.reply(dedent`
    Создание заявки на больничный.
    Для ее создания выполним несколько шагов.`
  );
  newRequest.title = getRequestTypeText(newRequest.type);

  await ctx.reply(dedent`
    Укажите причину выхода на больничный:`
  );
  newRequest.description = (await conv.waitFor("message:text")).message.text.trim();

  msgsId.push((await ctx.reply("Выберите приоритет заявки:", {
    reply_markup: priorityKeyboard
  })).message_id);
  newRequest.priority = (await conv.waitForCallbackQuery(
    Object.values(TaskPriorityEnum)
  )).callbackQuery.data;
  try {
    await requestsService.createRequest({
      tgID: ctx.from.id,
      request: newRequest
    });
    await ctx.reply("Заявка на больничный успешно создана!");
    await Promise.all(msgsId.map((id) =>
      ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
        reply_markup: new InlineKeyboard()
      })));
  } catch (error) {
    await ctx.reply(`Ошибка при создании заявки: ${error.message}`);
  }
}

async function createDraftRequest(conv: RequestConversation, ctx: RequestContext) {
  let newRequest: CreateRequestType = {
    type: ctx.callbackQuery.data,
    title: "",
    description: "",
    priority: ""
  }
  let msgsId = [];

  await ctx.reply(dedent`
    Создание черновика заявки.
    Для ее создания выполним несколько шагов.`
  );
  newRequest.title = getRequestTypeText(newRequest.type);

  await ctx.reply(dedent`
    Укажите описание черновика заявки:`
  );
  newRequest.description = (await conv.waitFor("message:text")).message.text.trim();

  msgsId.push((await ctx.reply("Выберите приоритет заявки:", {
    reply_markup: priorityKeyboard
  })).message_id);
  newRequest.priority = (await conv.waitForCallbackQuery(
    Object.values(TaskPriorityEnum)
  )).callbackQuery.data;

  try {
    await requestsService.createRequest({
      tgID: ctx.from.id,
      request: newRequest
    });
    await ctx.reply("Черновик заявки успешно создан!");
    await Promise.all(msgsId.map((id) =>
      ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
        reply_markup: new InlineKeyboard()
      })));
  } catch (error) {
    await ctx.reply(`Ошибка при создании черновика заявки: ${error.message}`);
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
    reply_markup: priorityKeyboard
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
requestsComposer.use(createConversation(createLeaveRequest));
requestsComposer.use(createConversation(createSickRequest));
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
      await ctx.conversation.enter("createRequest");
      break;
    case "leave_vacation":
      await ctx.conversation.enter("createLeaveRequest");
      break;
    case "leave_sick":
      await ctx.conversation.enter("createSickRequest");
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



function validateLeaveDates(startInput: string, endInput: string, type?: string): { msg: string, valid: boolean } {
  const startDate = dayjs(startInput, "DD.MM.YYYY");
  const endDate = dayjs(endInput, "DD.MM.YYYY");
  if (!startDate.isValid() || !endDate.isValid()) {
    return { msg: "Некорректный формат даты. Используйте дд.мм.гггг-дд.мм.гггг", valid: false };
  }
  if (startDate > endDate) {
    return { msg: "Дата начала отпуска не может быть позже даты окончания.", valid: false };
  }
  if (startDate < dayjs()) {
    return { msg: "Дата начала отпуска не может быть в прошлом.", valid: false };
  }
  if (startDate === endDate) {
    return { msg: "Дата начала и окончания отпуска не может быть одной и той же.", valid: false };
  }
  if (type === "vacation" && startDate.diff(endDate, 'day') > 30) {
    return { msg: "Максимальная продолжительность отпуска - 30 дней.", valid: false };
  }
  if (type === "leave_personal" && startDate.diff(endDate, 'day') > 14) {
    return { msg: "Максимальная продолжительность отгула - 14 дней.", valid: false };
  }
  return { msg: "", valid: true };

}