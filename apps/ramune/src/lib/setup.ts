// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= "development";

import { ApplicationCommandRegistries, RegisterBehavior } from "@sapphire/framework";
import "@sapphire/plugin-logger/register";
import { setup } from "@skyra/env-utilities";
import * as colorette from "colorette";
import { join } from "node:path";
import { rootDir, srcDir } from "./constants";

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

const isProduction = process.env.NODE_ENV === "production";

// Read env var
setup({ path: isProduction ? join(rootDir, ".env") : join(srcDir, ".env") });

// Enable colorette
colorette.createColors({ useColor: true });
