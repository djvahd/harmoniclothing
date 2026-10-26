import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import i18next from "eslint-plugin-i18next";

const eslintConfig = [
  ...coreWebVitals,
  ...nextTs,
  {
    // React Compiler rules added by eslint-config-next 16; existing code predates them.
    // Kept as warnings so lint stays green; fix incrementally.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
  {
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "warn",
        {
          "mode": "jsx-only",
          "jsx-attributes": {
            "exclude": [
              "className",
              "styleName",
              "style",
              "type",
              "key",
              "id",
              "width",
              "height",
              "variant",
              "size",
              "role",
              "as",
              "href",
              "src",
              "rel",
              "target",
              "name",
              "htmlFor",
              "colSpan",
              "autoComplete",
              "inputMode",
              "pattern",
              "accept",
              "method",
              "min",
              "max",
              "step",
              "maxLength",
              "data-testid",
              "align",
              "sizes",
              "fill",
              "loading",
              "priority",
              "value",
              "backHref"
            ]
          },
          "callees": {
            "exclude": [
              "i18n(ext)?",
              "t",
              "t[A-Z]\\w*",
              "tCommon",
              "require",
              "addEventListener",
              "removeEventListener",
              "postMessage",
              "getElementById",
              "dispatch",
              "commit",
              "includes",
              "indexOf",
              "endsWith",
              "startsWith",
              "router\\.push",
              "openAuthModal",
              "openPanelNow",
              "scheduleClosePanel",
              "toggleSection",
              "handleSubmit",
              "update",
              "formatCurrency",
              "Intl\\.NumberFormat"
            ]
          },
          "object-properties": {
            "exclude": [
              "[A-Z_-]+",
              "^id$",
              "^key$"
            ]
          },
          "words": {
            "exclude": [
              "[0-9!-/:-@[-`{-~]+",
              "[A-Z_-]+",
              "[\\u2018\\u2019\\u201C\\u201D\\u2013\\u2014\\u00B7\\u2022\\u2192\\u00A0]+",
              "Harmoni Clothing",
              "Rp",
              "\\/[\\w-]*",
              "[a-z]{2}-[A-Z]{2}",
              "x",
              "terlaris",
              "terbaru"
            ]
          }
        }
      ]
    },
  },
];

export default eslintConfig;
