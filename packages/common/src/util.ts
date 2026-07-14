import { config } from "dotenv"
import findConfig from "find-config"

export function tryParseEnv() {
    const path = findConfig(".env")
    if (path) config({ path })
}
