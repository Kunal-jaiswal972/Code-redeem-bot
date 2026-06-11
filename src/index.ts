import { registerShutdownHandlers } from "./browser/lifecycle.js";
import { runCli } from "./adapters/cli/runCli.js";
import { runServer } from "./adapters/server/runServer.js";
import { loadEnvFile } from "./config/loadEnv.js";
import { isCliMode, isServerMode } from "./config/cliArgs.js";
import { initRunHistoryStore } from "./infrastructure/storage/stores/runHistoryPersistence.js";
import { logger } from "./utils/utils.js";

loadEnvFile();
initRunHistoryStore();
registerShutdownHandlers();

function resolveMain(): Promise<void> {
  if (isServerMode()) {
    return runServer();
  }

  if (!isCliMode()) {
    logger.warn("No mode flag — defaulting to dev CLI. Use --server for production (npm start).");
  }

  return runCli();
}

const main = resolveMain();

main.catch((error) => {
  const cause = error instanceof Error ? error : new Error(String(error));
  logger.error("Fatal error:", cause);
  process.exitCode = 1;
});
