import { GameId } from "../../config/constants.js";
import type { GameModule } from "../../types/games.js";
import { genshinConfig } from "./config.js";
import { genshinRequiredEnvVars, parseGenshinCredentials } from "./credentials.js";
import { redeemGenshinCodes } from "./redeemer.js";
import { scrapeGenshinCodes } from "./scraper.js";

export const genshinGameModule: GameModule = {
  id: GameId.GENSHIN,
  displayName: "Genshin Impact",
  source: genshinConfig.source,
  requiredEnvVars: genshinRequiredEnvVars,
  parseCredentials: parseGenshinCredentials,
  scrapeCodes: scrapeGenshinCodes,
  redeemCodes: redeemGenshinCodes,
};
