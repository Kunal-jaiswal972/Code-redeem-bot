import type { GameIdValue } from "../config/constants.js";
import type { CodeStatusValue } from "../config/constants.js";
import type { ChromeSession } from "./browser.js";
import type { CodeRedeemResult, GameLoginCredentials, GameRedeemOptions } from "./redeem.js";

/** Raw row returned by a game-specific scraper before normalization. */
export interface ScrapedCodeRow {
  codes: string[];
  expired: boolean;
}

/** Flattened code ready for JSON store upsert. */
export interface NormalizedScrapedCode {
  code: string;
  status: CodeStatusValue;
}

export type GameScraper = () => Promise<ScrapedCodeRow[]>;

export type GameRedeemer = (
  session: ChromeSession,
  options: GameRedeemOptions,
) => Promise<CodeRedeemResult[]>;

export type GameCredentialParser = (
  env: NodeJS.ProcessEnv,
) => GameLoginCredentials;

/**
 * Full game plug-in. Register new games in `src/games/registry.ts` only.
 * See AGENTS.md → "Adding a new game".
 */
export interface GameModule {
  readonly id: GameIdValue;
  readonly displayName: string;
  readonly source: string;
  readonly requiredEnvVars: readonly string[];
  readonly parseCredentials: GameCredentialParser;
  readonly scrapeCodes: GameScraper;
  readonly redeemCodes: GameRedeemer;
}
