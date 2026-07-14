import type { EntityManager } from "@mikro-orm/core"
import { MikroORM, type EntityRepository, type IMigrator } from "@mikro-orm/mysql"
import { MediaFile, User, Property, LandlordQuestionnaire, TenantQuestionnaire, FavoriteProperty, Message, SearchHistoryV2 } from "../entities"
import { options } from "../../mikro-orm.config"

export const DB = {} as {
    orm: MikroORM
    em: EntityManager
    mediaFiles: EntityRepository<MediaFile>
    users: EntityRepository<User>
    properties: EntityRepository<Property>
    landlordQuestionnaires: EntityRepository<LandlordQuestionnaire>
    tenantQuestionnaires: EntityRepository<TenantQuestionnaire>
    favoriteProperty: EntityRepository<FavoriteProperty>
    messages: EntityRepository<Message>
    searchHistory: EntityRepository<SearchHistoryV2>
}

export async function initDatabase() {
    console.log("Trying to connect to DB...")
    DB.orm = await MikroORM.init(options)
    DB.em = DB.orm.em
    await ensureDatabase(DB.em)
    console.log("Connected to DB!")

    DB.mediaFiles = DB.em.getRepository(MediaFile)
    DB.users = DB.em.getRepository(User)
    DB.properties = DB.em.getRepository(Property)
    DB.landlordQuestionnaires = DB.em.getRepository(LandlordQuestionnaire)
    DB.tenantQuestionnaires = DB.em.getRepository(TenantQuestionnaire)
    DB.favoriteProperty = DB.em.getRepository(FavoriteProperty)
    DB.messages = DB.em.getRepository(Message)
    DB.searchHistory = DB.em.getRepository(SearchHistoryV2)

    await ensureDatabaseIsUpdated(DB.em)
}

export async function ensureDatabase(em: EntityManager) {
    const schema = em.getPlatform().getSchemaGenerator(em.getDriver(), em)
    await schema.ensureDatabase()
}

export async function ensureDatabaseIsUpdated(em: EntityManager) {
    const migrator = em.getPlatform().getExtension("Migrator", "@mikro-orm/migrator", "@mikro-orm/migrations", em) as IMigrator
    if ((await migrator.getPendingMigrations()).length > 0) {
        console.log("Migrating DB to latest version...")
        await migrator.up()
    }
}
