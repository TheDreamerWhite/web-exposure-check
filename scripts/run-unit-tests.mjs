import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run(["node_modules/typescript/bin/tsc", "-p", "tsconfig.test.json"]);
run([
  "--test",
  ".test-dist/tests/findings/compatibility.test.js",
  ".test-dist/tests/findings/presentation.test.js",
]);
