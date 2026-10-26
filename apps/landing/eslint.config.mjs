import next from "eslint-config-next";

export default [
  ...next,
  {
    rules: {
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },
];
