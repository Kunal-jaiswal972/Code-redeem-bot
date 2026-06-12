import fs from "node:fs";
import path from "node:path";
import type { Frame, Page } from "puppeteer-core";
import { getAppConfig } from "../../config/appConfig.js";
import { logger } from "../../utils/utils.js";

const LOGIN_DEBUG_FILENAME = "login-fail.png";
const LOGIN_HINT_FILENAME = "login-fail-hint.txt";
const MAX_HINT_LENGTH = 500;

function getLoginDebugDir(): string {
  const codeStoreBasePath = getAppConfig().codeStoreBasePath;
  return path.resolve(codeStoreBasePath, "..", "debug");
}

async function readLoginFrameHint(frame: Frame | null): Promise<string> {
  if (frame === null) {
    return "";
  }

  try {
    const text = await frame.evaluate(() => document.body?.innerText?.trim() ?? "");

    if (text.length === 0) {
      return "";
    }

    return text.slice(0, MAX_HINT_LENGTH);
  } catch {
    return "";
  }
}

export async function captureLoginFailureDebug(options: {
  page: Page;
  frame: Frame | null;
}): Promise<string | null> {
  try {
    const debugDir = getLoginDebugDir();
    fs.mkdirSync(debugDir, { recursive: true });

    const screenshotPath = path.join(debugDir, LOGIN_DEBUG_FILENAME);
    await options.page.screenshot({ path: screenshotPath, fullPage: true });

    const hint = await readLoginFrameHint(options.frame);
    const hintPath = path.join(debugDir, LOGIN_HINT_FILENAME);

    if (hint.length > 0) {
      fs.writeFileSync(hintPath, hint, "utf8");
      logger.warn(`Login iframe hint saved: ${hintPath}`);
    }

    logger.warn(`Login debug screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));
    logger.warn(`Could not save login debug artifacts: ${cause.message}`);
    return null;
  }
}
