import { Context, SessionFlavor } from "grammy";
import { RequestsSession, TasksSession, UserSession } from "./session.type";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";

type TaskComposerConversation = ConversationFlavor<Context & SessionFlavor<TasksSession>>;
type TaskContext = Context & SessionFlavor<TasksSession>;
type TaskConversation = Conversation<TaskComposerConversation, TaskContext>;

type UserComposerConversation = ConversationFlavor<Context & SessionFlavor<UserSession>>;
type UserContext = Context & SessionFlavor<UserSession>;
type UserConversation = Conversation<UserComposerConversation, UserContext>;

type RequestComposerConversation = ConversationFlavor<Context & SessionFlavor<RequestsSession & UserSession>>;
type RequestContext = Context & SessionFlavor<RequestsSession & UserSession>;
type RequestConversation = Conversation<RequestComposerConversation, RequestContext>;

export {
  TaskContext,
  TaskConversation,
  TaskComposerConversation,
  UserContext,
  UserConversation,
  UserComposerConversation,
  RequestContext,
  RequestConversation,
  RequestComposerConversation
};