import type { IProperty } from "@gdsd/common/models"
import { Entity, PrimaryKey, Property as Prop, Enum, OneToMany, Collection, OptionalProps, ManyToOne, type Opt } from "@mikro-orm/mysql"
import { v4 } from "uuid"
import { MediaFile } from "./MediaFile"
import { PropertyType } from "@gdsd/common/models"
import { PropertyStatus } from "@gdsd/common/models"
import { User } from "./User"

@Entity()
export class Property implements IProperty {
    [OptionalProps]?: "warmRent"

    @PrimaryKey({ type: "uuid" })
    id: string = v4()

    @Prop()
    creationDate: Date = new Date()

    @Prop<Property>({ onCreate: e => new Date(e.creationDate.getTime() + 60 * 24 * 60 * 60 * 1000) })
    renewalDate!: Date & Opt

    @Prop()
    reviewDate?: Date

    @ManyToOne(() => User)
    landlord!: User

    @Prop()
    name!: string

    @Prop()
    location!: string

    @Prop()
    description?: string

    @Enum(() => PropertyType)
    type!: PropertyType

    @Enum(() => PropertyStatus)
    status: PropertyStatus = PropertyStatus.Pending

    @Prop()
    coldRent!: number

    @Prop()
    additionalCosts!: number

    @Prop<Property>({ columnType: "int", generated: cols => `(${cols.coldRent} + ${cols.additionalCosts}) stored` })
    warmRent!: number & Opt

    @Prop()
    deposit!: number

    @Prop()
    availabilityFrom!: Date

    @Prop()
    availabilityTo!: Date

    @Prop()
    size?: number

    @Prop()
    arePetsAllowed?: boolean

    @Prop({ default: 0 })
    visits?: number = 0

    @Prop({ type: "uuid" })
    landlordQuestionnaireId?: string

    @OneToMany(() => MediaFile, mediaFile => mediaFile.property)
    mediaFiles = new Collection<MediaFile>(this)

    @Prop({ type: "json", nullable: true })
    amenitiesValues: { amenityId: string, value: "yes" | "no" }[] = []
}
