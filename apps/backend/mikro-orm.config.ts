import { defineConfig, type Options } from "@mikro-orm/mysql"
import { TsMorphMetadataProvider } from "@mikro-orm/reflection"
import { tryParseEnv } from "@gdsd/common/util"
import { LandlordQuestionnaire, MediaFile, Property, User, FavoriteProperty, Message, TenantQuestionnaire, SearchHistoryV2 } from "./src/entities"
import { Amenity } from "./src/entities/Amenity"
import { Migrator } from "@mikro-orm/migrations"

tryParseEnv()

export const options: Options = {
    metadataProvider: TsMorphMetadataProvider,
    entities: [Amenity, FavoriteProperty, LandlordQuestionnaire, MediaFile, Message, Property, SearchHistoryV2, User, TenantQuestionnaire],
    entitiesTs: ["./src/entities"],
    clientUrl: process.env["DB_CONNECTION"],
    seeder: {
        path: "./src/db/seeders"
    },
    allowGlobalContext: true,
    extensions: [Migrator],
    migrations: {
        pathTs: "./src/db/migrations",
        snapshotName: ".snapshot"
    }
}

export default defineConfig(options)
