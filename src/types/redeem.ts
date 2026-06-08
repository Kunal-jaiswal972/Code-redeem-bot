import type { RedeemStatusValue } from "../config/constants.js";

export interface GameLoginCredentials {
  email: string;
  password: string;
  server: string;
}

export interface CodeRedeemResult {
  code: string;
  status: RedeemStatusValue;
  message: string;
}

export interface GameRedeemOptions {
  credentials: GameLoginCredentials;
  codes: string[];
  onCodeRedeemed?: (result: CodeRedeemResult) => Promise<void>;
}
