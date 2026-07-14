import { copy } from "esbuild-plugin-copy"
import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts"],
    clean: true,
    format: "iife",
    outExtension: () => ({
        js: ".js",
        dts: ".d.ts"
    }),
    bundle: true,
    platform: "node",
    experimentalDts: true,
    esbuildPlugins: [
        copy({
            assets: [
                {
                    from: "public/**/*",
                    to: "public"
                },
                {
                    from: "dist/_tsup-dts-rollup.d.ts",
                    to: "index.d.ts"
                }
            ]
        })
    ],
    esbuildOptions(options) {
        options.external = [
            "better-sqlite3",
            "libsql",
            "mariadb/callback",
            "oracledb",
            "pg",
            "pg-query-stream",
            "sqlite3",
            "tedious"
        ]
    }
})
