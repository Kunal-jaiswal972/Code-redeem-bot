import { createScheduler } from "../../scheduling/createScheduler.js";
import { createCliAdapter } from "./createCliAdapter.js";
import { createCliAdapterPorts } from "./createCliPorts.js";
import { createSchedulerOnTrigger } from "../shared/schedulerOnTrigger.js";

export async function runCli(): Promise<void> {
  const { prompt, display } = createCliAdapterPorts();
  const scheduler = createScheduler({
    onTrigger: createSchedulerOnTrigger({ fallbackPort: prompt }),
  });
  const adapter = createCliAdapter({
    prompt,
    display,
    scheduler,
    source: "cli",
  });

  await scheduler.start();

  try {
    await adapter.start();
  } finally {
    await adapter.stop();
    await scheduler.stop();
  }
}
