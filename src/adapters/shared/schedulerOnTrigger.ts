import type { Bot } from "grammy";
import type { SchedulerTriggerHandler } from "../../scheduling/scheduler.js";
import type { PromptPort } from "../contracts/promptPort.js";
import { notifyTelegramScheduledRun } from "../telegram/createTelegramAdapter.js";
import { createScheduledRunHandler } from "./scheduledRunHandler.js";

export interface CreateSchedulerOnTriggerOptions {
  readonly fallbackPort: PromptPort;
  readonly getTelegramBot?: () => Bot | null;
}

export function createSchedulerOnTrigger(
  options: CreateSchedulerOnTriggerOptions,
): SchedulerTriggerHandler {
  const { fallbackPort, getTelegramBot } = options;

  return async (task) => {
    const bot = getTelegramBot?.() ?? null;

    if (bot !== null) {
      const chatIdRaw = task.metadata?.telegramChatId;
      const chatId =
        chatIdRaw !== undefined ? Number.parseInt(chatIdRaw, 10) : Number.NaN;

      if (!Number.isNaN(chatId)) {
        await notifyTelegramScheduledRun(bot, task);
        return;
      }
    }

    const handler = createScheduledRunHandler(fallbackPort);
    await handler(task);
  };
}
