import type { GameIdValue } from "../config/constants.js";
import type { GameRedeemer } from "../types/games.js";
import { getGameModule } from "./registry.js";

export function getGameRedeemer(gameId: GameIdValue): GameRedeemer {
  return getGameModule(gameId).redeemCodes;
}
