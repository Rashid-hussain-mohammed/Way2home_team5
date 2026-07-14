import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"
import onlyWarn from "eslint-plugin-only-warn"
import stylistic from "@stylistic/eslint-plugin"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        plugins: {
            turbo: turboPlugin
        },
        rules: {
            "turbo/no-undeclared-env-vars": "warn"
        }
    },
    {
        plugins: {
            onlyWarn
        }
    },
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: false,
        jsx: true,
        commaDangle: "never"
    }),
    {
        rules: {
            "@stylistic/no-multiple-empty-lines": [
                "warn", {
                    max: 2
                }
            ]
        }
    },
    {
        ignores: ["dist/**"]
    }
]
