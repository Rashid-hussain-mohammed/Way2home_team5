import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/**/*"],
    dts: true,
    splitting: false,
    clean: true,
    format: "esm"
})
