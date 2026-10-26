import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
export const maxLinesRule = {
  rules: {
    "max-lines": [
      "error",
      { max: 400, skipBlankLines: true, skipComments: true },
    ],
  },
};

export { configDir };
