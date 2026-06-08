import { z } from "zod";
import type { GameLoginCredentials } from "../../types/redeem.js";
import { HsrServer } from "./constants.js";

const hsrServerSchema = z.enum([
  HsrServer.AMERICA,
  HsrServer.EUROPE,
  HsrServer.ASIA,
  HsrServer.TW_HK_MO,
]);

const hsrCredentialsSchema = z.object({
  HSR_EMAIL: z.string().email("HSR_EMAIL must be a valid email"),
  HSR_PASSWORD: z.string().min(1, "HSR_PASSWORD is required"),
  HSR_SERVER: hsrServerSchema.default(HsrServer.ASIA),
});

export const hsrRequiredEnvVars = [
  "HSR_EMAIL",
  "HSR_PASSWORD",
  "HSR_SERVER",
] as const;

export function parseHsrCredentials(
  env: NodeJS.ProcessEnv,
): GameLoginCredentials {
  const parsed = hsrCredentialsSchema.parse(env);

  return {
    email: parsed.HSR_EMAIL.trim(),
    password: parsed.HSR_PASSWORD,
    server: parsed.HSR_SERVER,
  };
}
