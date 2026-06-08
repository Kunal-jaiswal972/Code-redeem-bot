import { GameId } from "../../config/constants.js";
import type { GameModule } from "../../types/games.js";
import { hsrConfig } from "./config.js";
import { hsrRequiredEnvVars, parseHsrCredentials } from "./credentials.js";
import { redeemHsrCodes } from "./redeemer.js";
import { scrapeHsrCodes } from "./scraper.js";

export const hsrGameModule: GameModule = {
  id: GameId.HSR,
  displayName: "Honkai: Star Rail",
  source: hsrConfig.source,
  requiredEnvVars: hsrRequiredEnvVars,
  parseCredentials: parseHsrCredentials,
  scrapeCodes: scrapeHsrCodes,
  redeemCodes: redeemHsrCodes,
};
