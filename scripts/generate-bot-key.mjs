#!/usr/bin/env node
import { createHash, randomBytes } from "node:crypto";

const bot = process.argv[2] ?? "lucius";
const key = randomBytes(32).toString("hex");
const hash = createHash("sha256").update(key, "utf8").digest("hex");

const snippet = JSON.stringify({ [bot]: hash }, null, 2);

console.log(`Bot name: ${bot}`);
console.log(`Raw key (give to the bot — store securely):\n${key}\n`);
console.log(`SHA-256 hash (put in GROKBOT_KEYS_JSON):\n${hash}\n`);
console.log(`Sample GROKBOT_KEYS_JSON entry:\n${snippet}\n`);
console.log(
  "Merge into .env.local, e.g. GROKBOT_KEYS_JSON=" +
    JSON.stringify(JSON.stringify({ [bot]: hash })),
);