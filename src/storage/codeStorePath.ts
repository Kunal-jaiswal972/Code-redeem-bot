import path from "node:path";
import type { GameIdValue } from "../config/constants.js";

export const DEFAULT_CODE_STORE_BASE_PATH = "./src/data";

export function resolveCodeStorePath(
  basePath: string,
  gameId: GameIdValue,
): string {
  return path.resolve(basePath, gameId, "codes.json");
}
