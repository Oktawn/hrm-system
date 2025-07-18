import { createConversation } from "@grammyjs/conversations";
import { Composer, InlineKeyboard, Keyboard } from "grammy";
import { RequestComposerConversation, RequestContext, RequestConversation } from "../commons/context.types";
import { RequestTypeEnum, TaskPriorityEnum, UserRoleEnum } from "../commons/enums";
import { RequestsService } from "../services/requests.service";
import { CreateRequestType, DataTelegramm, RequestType } from "../commons/types";
import { envConfig } from "../config/config";
import { showEmployee } from "./tasks.bot";
import { getPriorityText, getRequestStatusText, getRequestTypeText } from "../commons/status.util";
import dedent from "dedent";
import { priorityKeyboard, requestHRKeyboard, requestKeyboard, requestTypeKeyboard } from "./keyboards.bot";
import dayjs from "dayjs";
import { NextFunction } from "express";
import { TasksService } from "../services/tasks.service";

export const requestsComposer = new Composer<RequestComposerConversation>();
const requestsService = new RequestsService();
const taskservice = new TasksService();

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


async function createRequest(conv: RequestConversation, ctx: RequestContext, next: NextFunction) {
  await ctx.reply(`Выберите тип заявки, которую хотите создать:`, {
    reply_markup: requestTypeKeyboard
  });
  next();
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
    Важно помнить:
    > Отпуск согласуется не раньше чем за месяц до его начала.
    > Отпуск может быть предоставлен на срок не более 30 дней.
    > Неоплачиваемый отпуск согласуется не раньше чем за 3 дня до его начала.
    > Неоплачиваемый отпуск может быть предоставлен на срок не более 14 дней.

    Для ее создания выполним несколько шагов.`
  );

  newRequest.title = getRequestTypeText(newRequest.type);

  if (newRequest.type === RequestTypeEnum.LEAVE_PERSONAL) {
    await ctx.reply(dedent`
      Укажите причину заявки на отпуск:`
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

async function addComment(conv: RequestConversation, ctx: RequestContext) {
  const inKeyboard = new InlineKeyboard()
    .text("К задаче", "task")
    .text("К заявке", "request")
  const id = (await ctx.reply(dedent`
    Вы перешли в раздел добавления комментария.
    Также можете прикрепить файл, если это необходимо.
    Для начала укажите к задаче или заявке хотите добавить комментарий:
    `, {
    reply_markup: inKeyboard
  })).message_id;
  const type = (await conv.waitForCallbackQuery(["task", "request"])).callbackQuery.data;
  await ctx.reply(`Введите ID ${type.toLowerCase() === "task" ? "задачи" : "заявки"} для добавления комментария:`);
  const requestId = (await conv.waitFor("message:text")).message.text.trim();

  try {
    const check = type === "task" ? await taskservice.getTaskById({
      id: parseInt(requestId),
      tgID: ctx.from.id
    }) : await requestsService.getRequestsById({
      tgID: ctx.from.id,
      id: parseInt(requestId)
    });
    if (!check) {
      await ctx.reply(`${type} с ID ${requestId} не найдена.`);
      return;
    }
    await ctx.reply(`Введите текст комментария и прикрепите файл, если это необходимо, к ${type.toLowerCase()} ID ${requestId}:`);
    const comment = await conv.waitFor("message");
    let file: DataTelegramm = {};
    if (comment.message.document) {
      file = {
        fileUrl: (await ctx.api.getFile(comment.message.document.file_id)).file_path,
        fileName: comment.message.document.file_name,
        fileMime: comment.message.document.mime_type
      };
    }
    if (comment.message.photo) {
      const photo = comment.message.photo[comment.message.photo.length - 1];
      file = {
        fileUrl: (await ctx.api.getFile(photo.file_id)).file_path,
        fileMime: "image/jpeg",
        fileName: `photo.jpg`,
        height: photo.height,
        width: photo.width
      };
    }
    await requestsService.addComment({
      content: comment.message?.text ? comment.message.text.trim() : comment.message.caption?.trim(),
      tgID: ctx.from.id,
      type: type === "Заявка" ? "request" : "task",
      requestId: parseInt(requestId),
      file: file
    })
    await ctx.reply("Комментарий успешно добавлен.");
  } catch (error) {
    await ctx.reply(`Ошибка при добавлении комментария: ${error.message}`);
  } finally {
    await ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
      reply_markup: new InlineKeyboard()
    });
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

requestsComposer.use(createConversation(addComment));
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
      if (ctx.session.user.role === UserRoleEnum.EMPLOYEE) {
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
    case "add_comment":
      await ctx.conversation.enter("addComment");
      break;
    case "requests_find_employee":
      await ctx.conversation.enter("findEmployeeRequests");
      break;
    case "requests_find_priority":
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

  if (type === "leave_vacation" && startDate.diff(endDate, 'day') > 30) {
    return { msg: "Максимальная продолжительность отпуска - 30 дней.", valid: false };
  }
  if (type === "leave_vacation" && startDate.diff(dayjs(), 'day') < 30) {
    return { msg: "Отпуск должен быть запланирован не менее чем за 30 дней.", valid: false };
  }
  if (type === "leave_personal" && startDate.diff(dayjs(), 'day') < 3) {
    return { msg: "Неоплачиваемый отпуск должен быть запланирован не менее чем за 3 дня.", valid: false };
  }
  if (type === "leave_personal" && startDate.diff(endDate, 'day') > 14) {
    return { msg: "Максимальная продолжительность отгула - 14 дней.", valid: false };
  }
  return { msg: "", valid: true };

}