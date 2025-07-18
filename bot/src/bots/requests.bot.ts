import { createConversation } from "@grammyjs/conversations";
import { Composer, InlineKeyboard, Keyboard } from "grammy";
import { RequestComposerConversation, RequestContext, RequestConversation } from "../commons/context.types";
import { RequestStatusEnum, RequestTypeEnum, TaskPriorityEnum, UserRoleEnum } from "../commons/enums";
import { RequestsService } from "../services/requests.service";
import { CreateRequestType, DataTelegramm, RequestType } from "../commons/types";
import { envConfig } from "../config/config";
import { showEmployee } from "./tasks.bot";
import { escapeSpecialChars, getPriorityText, getRequestStatusText, getRequestTypeText } from "../commons/status.util";
import dedent from "dedent";
import { priorityKeyboard, requestHRKeyboard, requestKeyboard, requestTypeKeyboard, statusRequestKeyboard } from "./keyboards.bot";
import dayjs from "dayjs";
import { TasksService } from "../services/tasks.service";
import moment from "moment";
import { RequestDataSession } from "../commons/session.type";

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
    console.log("Session requests initialized");
  }
  await next();
});

const dataOnPage = 10;

function listRequests(requests: RequestDataSession) {
  const { requests: requestList, totalPages, currentPage } = requests;

  const startIndex = currentPage * dataOnPage;
  const endIndex = startIndex + dataOnPage;
  const requestsForPage = requestList.slice(startIndex, endIndex);

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
    Заявка: ${request.id}
    Название: ${escapeSpecialChars(request.title) || ' '}
    Описание: ${escapeSpecialChars(request.description) || ' '}
    Тип: ${getRequestTypeText(request.type) || ' '}
    Создатель: ${request.creator ? escapeSpecialChars(showEmployee(request.creator)) : ' '}
    Исполнитель: ${request.assignee ? escapeSpecialChars(showEmployee(request.assignee)) : ' '}
    Статус: ${getRequestStatusText(request.status) || ' '}
    Приоритет: ${getPriorityText(request.priority) || ' '}
    URL: [внешняя ссылка](${url})`;
  return msg;
}

async function getRequests(conv: RequestConversation, ctx: RequestContext) {
  await ctx.reply("Получение заявок...");
  try {
    const requests = await requestsService.getRequests({
      tgID: ctx.from.id
    });
    const requestsData: RequestDataSession = {
      requests: requests,
      currentPage: 0,
      totalPages: Math.ceil(requests.length / dataOnPage)
    }
    await conv.external((ctx) => {
      ctx.session.requests = requestsData;
    });
    if (requests.length === 0) {
      await ctx.reply("Заявок не найдено.");
    } else {
      await ctx.reply("Ваши заявки:", {
        reply_markup: listRequests(requestsData)
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
}


async function createDocumentRequest(conv: RequestConversation, ctx: RequestContext) {
  let newRequest: CreateRequestType = {
    type: ctx.callbackQuery?.data || RequestTypeEnum.DOCUMENT,
    title: getRequestTypeText(RequestTypeEnum.DOCUMENT),
    description: "",
    priority: ""
  };
  let msgsId = [];

  await ctx.reply(dedent`
    Создание заявки на документ.
    Введите, пожалуйста, описание или цель документа:`
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
    await ctx.reply("Заявка на документ успешно создана!");
  } catch (error) {
    await ctx.reply(`Ошибка при создании заявки: ${error.message}`);
  } finally {
    await Promise.all(msgsId.map((id) =>
      ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
        reply_markup: new InlineKeyboard()
      })));
  }
}

async function createCertificateRequest(conv: RequestConversation, ctx: RequestContext) {
  let newRequest: CreateRequestType = {
    type: ctx.callbackQuery?.data || RequestTypeEnum.CERTIFICATE,
    title: getRequestTypeText(RequestTypeEnum.CERTIFICATE),
    description: "",
    priority: ""
  };
  let msgsId = [];

  await ctx.reply(dedent`
    Создание заявки на справку.
    Введите, пожалуйста, для чего нужна справка или дополнительные детали:`
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
    await ctx.reply("Заявка на справку успешно создана!");
  } catch (error) {
    await ctx.reply(`Ошибка при создании заявки: ${error.message}`);
  } finally {
    await Promise.all(msgsId.map((id) =>
      ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
        reply_markup: new InlineKeyboard()
      })));
  }
}


async function createLeaveRequest(conv: RequestConversation, ctx: RequestContext) {
  let newRequest: CreateRequestType = {
    type: ctx.callbackQuery.data,
    title: "",
    description: "Оплачиваемый отпуск",
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
  newRequest.startDate = moment(startInput, "DD.MM.YYYY").toDate();
  newRequest.endDate = moment(endInput, "DD.MM.YYYY").toDate();
  newRequest.duration = moment(newRequest.endDate).diff(moment(newRequest.startDate), 'days') + 1;
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
  } catch (error) {
    await ctx.reply(`Ошибка при создании заявки: ${error.message}`);
  } finally {
    await Promise.all(msgsId.map((id) =>
      ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
        reply_markup: new InlineKeyboard()
      })));
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
  } catch (error) {
    await ctx.reply(`Ошибка при создании заявки: ${error.message}`);
  } finally {
    await Promise.all(msgsId.map((id) =>
      ctx.api.editMessageReplyMarkup(ctx.chatId, id, {
        reply_markup: new InlineKeyboard()
      })));
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
  const type = (await conv.waitForCallbackQuery(["task", "request"])).callbackQuery.data as "task" | "request";
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
      content: comment.message?.text ? comment.message.text.trim() : comment.message.caption?.trim() ? comment.message.caption.trim() : file.fileName,
      tgID: ctx.from.id,
      type: type,
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
  await ctx.reply("Введите Фамилию и/или имя сотрудника для поиска заявок:");
  const employeeName = await conv.waitFor("message:text");
  await ctx.reply(`Поиск заявок сотрудника: ${employeeName.message.text}`);
  try {
    const requests = await requestsService.getEmployeeRequests({
      tgID: ctx.from.id,
      employeeName: employeeName.message.text.replace(/\s+/g, "_").trim()
    });
    const requestsData: RequestDataSession = {
      currentPage: 0,
      totalPages: Math.round(requests.length / dataOnPage),
      requests: requests
    };
    await conv.external((ctx) => {
      ctx.session.requests = requestsData;
    });
    if (requests.length === 0) {
      await ctx.reply("Заявки не найдены.");
    }
    else {
      await ctx.reply("Заявки сотрудника:", {
        reply_markup: listRequests(requestsData)
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
    const dataRequest: RequestDataSession = {
      currentPage: 0,
      totalPages: Math.ceil((Array.isArray(result) ? result.length : 1) / dataOnPage),
      requests: result
    };
    await conv.external((ctx) => {
      ctx.session.requests = dataRequest;
    });
    if (result.length === 0) {
      await ctx.reply("Заявок с таким приоритетом не найдено.");
    }
    else {
      await ctx.reply(`Заявки с приоритетом "${getPriorityText(ans.callbackQuery.data)}": `, {
        reply_markup: listRequests(dataRequest),
      });
    }
  } catch (error) {
    await ctx.reply("Произошла ошибка при получении заявок.");
  }

  return;
}

async function getRequestsById(conv: RequestConversation, ctx: RequestContext) {
  await ctx.reply("Введите ID заявки для просмотра:");
  const requestId = (await conv.waitFor("message:text")).message.text.trim();

  if (!requestId) {
    await ctx.reply("Пожалуйста, укажите ID заявки.");
    return;
  }
  try {
    const request = await requestsService.getRequestsById({
      tgID: ctx.from.id,
      id: parseInt(requestId)
    });
    if (request) {
      let msg = showRequests(request);
      await ctx.reply(msg, {
        parse_mode: "MarkdownV2",
      });
    } else {
      await ctx.reply("Заявка не найдена.");
    }
  } catch (error) {
    ctx.reply("Произошла ошибка при получении заявки.");
  }
  return;
};

async function getRequestsByStatus(conv: RequestConversation, ctx: RequestContext) {
  await ctx.reply("Выберите статус заявки", {
    reply_markup: statusRequestKeyboard
  });
  const ans = await conv.waitForCallbackQuery(Object.values(RequestStatusEnum) as string[]);
  try {
    const result = await requestsService.getRequestsByStatus({
      tgID: ctx.from.id,
      status: ans.callbackQuery.data
    });
    const dataRequest = {
      currentPage: 0,
      totalPages: Math.ceil((Array.isArray(result) ? result.length : 1) / dataOnPage),
      requests: Array.isArray(result) ? result : [result]
    }
    await conv.external((ctx) => {
      ctx.session.requests = dataRequest;
    });
    if (dataRequest.requests.length === 0) {
      await ctx.reply("Заявок с таким статусом не найдено.");
    } else {
      await ctx.reply(`Заявки со статусом "${getRequestStatusText(ans.callbackQuery.data)}": `, {
        reply_markup: listRequests(dataRequest),
      });
    }
  } catch (error) {
    ctx.reply("Произошла ошибка при получении заявок.");
  }
  return;
}

requestsComposer.use(createConversation(addComment));
requestsComposer.use(createConversation(getRequests));
requestsComposer.use(createConversation(createRequest));
requestsComposer.use(createConversation(createDocumentRequest));
requestsComposer.use(createConversation(createCertificateRequest));
requestsComposer.use(createConversation(createLeaveRequest));
requestsComposer.use(createConversation(createSickRequest));
requestsComposer.use(createConversation(getRequestsById));
requestsComposer.use(createConversation(getRequestsByStatus));
requestsComposer.use(createConversation(findEmployeeRequests));
requestsComposer.use(createConversation(getRequestsByPriority));

requestsComposer.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;

  switch (data) {
    case "requests_start":
      if (ctx.session.user.role === UserRoleEnum.EMPLOYEE) {
        await ctx.reply("Добро пожаловать в управление заявками:", {
          reply_markup: requestKeyboard,
        });
      }
      else {
        await ctx.reply("Добро пожаловать в управление заявками:", {
          reply_markup: requestHRKeyboard,
        });
      }
      break;
    case "requests_create":
      await ctx.conversation.enter("createRequest");
      break;
    case "leave_vacation":
    case "leave_personal":
      await ctx.conversation.enter("createLeaveRequest");
      break;
    case "requests_view":
      await ctx.conversation.enter("getRequests");
      break;
    case "leave_sick":
      await ctx.conversation.enter("createSickRequest");
      break;
    case "add_comment":
      await ctx.conversation.enter("addComment");
      break;
    case "requests_by_employee":
      await ctx.conversation.enter("findEmployeeRequests");
      break;
    case "document":
      await ctx.conversation.enter("createDocumentRequest");
      break;
    case "certificate":
      await ctx.conversation.enter("createCertificateRequest");
      break;
    case "requests_by_priority":
      await ctx.conversation.enter("getRequestsByPriority");
      break;
    case "requests_by_id":
      await ctx.conversation.enter("getRequestsById");
      break;
    case "requests_by_status":
      await ctx.conversation.enter("getRequestsByStatus");
      break;
    case "requests_prev":
      if (ctx.session.requests.currentPage > 0) {
        ctx.session.requests.currentPage--;
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: listRequests(ctx.session.requests)
      });
      break;
    case "requests_next":
      if (ctx.session.requests.currentPage < ctx.session.requests.totalPages - 1) {
        ctx.session.requests.currentPage++;
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: listRequests(ctx.session.requests)
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
      }
      break;
  }

  await next();
});



function validateLeaveDates(startInput: string, endInput: string, type?: string): { msg: string, valid: boolean } {
  const startDate = moment(startInput, "DD.MM.YYYY");
  const endDate = moment(endInput, "DD.MM.YYYY");
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
  if (type === "leave_vacation" && startDate.diff(moment(), 'day') < 30) {
    return { msg: "Отпуск должен быть запланирован не менее чем за 30 дней.", valid: false };
  }
  if (type === "leave_personal" && startDate.diff(moment(), 'day') < 3) {
    return { msg: "Неоплачиваемый отпуск должен быть запланирован не менее чем за 3 дня.", valid: false };
  }
  if (type === "leave_personal" && startDate.diff(endDate, 'day') > 14) {
    return { msg: "Максимальная продолжительность отгула - 14 дней.", valid: false };
  }
  return { msg: "", valid: true };

}