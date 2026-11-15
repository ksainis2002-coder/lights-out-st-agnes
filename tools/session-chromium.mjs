// Cloud sessions ship one Chromium, which can be newer than the build the
// pinned Playwright asks for. When it is there, the tests and the still
// tool launch that one; on GitHub Actions and on the owner's PC the path
// does not exist and Playwright uses its own browser.
import { existsSync } from 'node:fs';

const SESSION_CHROMIUM = '/opt/pw-browsers/chromium';

export const executablePath = existsSync(SESSION_CHROMIUM) ? SESSION_CHROMIUM : undefined;
