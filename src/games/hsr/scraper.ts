import type { ScrapedCodeRow } from "../../types/games.js";
import { hsrStubCodes } from "./config.js";

export async function scrapeHsrCodes(): Promise<ScrapedCodeRow[]> {
  return hsrStubCodes.map((code) => ({
    codes: [code],
    expired: false,
  }));
}
