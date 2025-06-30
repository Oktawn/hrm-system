import { Context, SessionFlavor } from "grammy";
import { TasksSession } from "./session.type";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";

type TaskContext = Context & SessionFlavor<TasksSession>;
type TaskConversation = Conversation<ConversationFlavor<TaskContext>>
type TaskComposerConversation = ConversationFlavor<TaskContext> & SessionFlavor<TasksSession>;

export {
  TaskContext,
  TaskConversation,
  TaskComposerConversation,
}