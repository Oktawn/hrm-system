import { Context, SessionFlavor } from "grammy";
import { RequestsSession, TasksSession, UserSession } from "./session.type";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";

type TaskContext = Context & SessionFlavor<TasksSession>;
type TaskConversation = Conversation<ConversationFlavor<TaskContext>>
type TaskComposerConversation = ConversationFlavor<TaskContext> & SessionFlavor<TasksSession>;


type UserContext = Context & SessionFlavor<UserSession>;
type UserConversation = Conversation<ConversationFlavor<UserContext>>;
type UserComposerConversation = ConversationFlavor<UserContext> & SessionFlavor<UserSession>;

type RequestContext = UserContext & SessionFlavor<RequestsSession>;
type RequestConversation = Conversation<ConversationFlavor<RequestContext>>;
type RequestComposerConversation = ConversationFlavor<RequestContext> & SessionFlavor<RequestsSession>;

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