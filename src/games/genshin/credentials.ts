import { z } from "zod";
import { GenshinServer } from "../../config/constants.js";
import type { GameLoginCredentials } from "../../types/redeem.js";

const genshinServerSchema = z.enum([
  GenshinServer.AMERICA,
  GenshinServer.EUROPE,
  GenshinServer.ASIA,
  GenshinServer.TW_HK_MO,
]);

const genshinCredentialsSchema = z.object({
  GENSHIN_EMAIL: z.string().email("GENSHIN_EMAIL must be a valid email"),
  GENSHIN_PASSWORD: z.string().min(1, "GENSHIN_PASSWORD is required"),
  GENSHIN_SERVER: genshinServerSchema.default(GenshinServer.ASIA),
});

export const genshinRequiredEnvVars = [
  "GENSHIN_EMAIL",
  "GENSHIN_PASSWORD",
  "GENSHIN_SERVER",
] as const;

export function parseGenshinCredentials(
  env: NodeJS.ProcessEnv,
): GameLoginCredentials {
  const parsed = genshinCredentialsSchema.parse(env);

  return {
    email: parsed.GENSHIN_EMAIL.trim(),
    password: parsed.GENSHIN_PASSWORD,
    server: parsed.GENSHIN_SERVER,
  };
}
