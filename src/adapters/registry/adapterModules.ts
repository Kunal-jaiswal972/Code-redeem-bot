import type { AdapterModule } from "./adapterModule.js";
import { cliAdapterModule } from "../cli/cliAdapterModule.js";
import { telegramAdapterModule } from "../telegram/telegramAdapterModule.js";

/**
 * Central adapter registry. To add an adapter (e.g. Discord, HTTP API):
 * 1. Implement `AdapterModule` under `adapters/<name>/`
 * 2. Append it here
 */
export const adapterModules = [
  cliAdapterModule,
  telegramAdapterModule,
] as const satisfies readonly AdapterModule[];
