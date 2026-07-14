import { Entity, PrimaryKey, Property, Enum, ManyToOne } from "@mikro-orm/mysql"
import { v4 } from "uuid"
import { User } from "./User"
import { PropertyType, PropertyStatus } from "@gdsd/common/models"

@Entity({ tableName: "new_search_history" })
export class SearchHistoryV2 {
    @PrimaryKey({ type: "uuid" })
    id: string = v4()

    @Property({ nullable: true })
    creationDate?: Date = new Date()

    @ManyToOne(() => User)
    user!: User

    @Property()
    query!: string

    @Property()
    location!: string

    @Property({ nullable: true })
    description?: string

    @Enum(() => PropertyType)
    type?: PropertyType

    @Enum(() => PropertyStatus)
    status: PropertyStatus = PropertyStatus.Pending

    @Property({ nullable: true })
    maxRent?: number

    @Property({ nullable: true })
    minRent?: number

    @Property({ nullable: true })
    deposit?: number

    @Property({ nullable: true })
    availabilityFrom?: Date

    @Property({ nullable: true })
    availabilityTo?: Date

    @Property({ nullable: true })
    minSize?: number

    @Property({ nullable: true })
    maxSize?: number

    @Property({ nullable: true })
    arePetsAllowed?: boolean

    @Property({ nullable: true })
    searchPreferencesId?: string

    @Property({ type: "json", nullable: true })
    amenitiesValues: { amenityId: string, value: "yes" | "no" }[] = []
}
