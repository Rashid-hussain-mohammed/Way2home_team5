import type { IMediaFile } from "@gdsd/common/models"
import { Entity, Enum, PrimaryKey, Property as Prop, ManyToOne } from "@mikro-orm/mysql"
import { v4 } from "uuid"
import { MediaType } from "@gdsd/common/models"
import { Property } from "./Property"

@Entity()
export class MediaFile implements IMediaFile {
    @PrimaryKey({ type: "uuid" })
    id = v4()

    @Prop({ hydrate: true })
    creationDate = new Date()

    @Enum(() => MediaType)
    type: MediaType

    // constructor(type: MediaType) {
    //     this.type = type
    // }

    @ManyToOne(() => Property, { hidden: true })
    property?: Property

    constructor(type: MediaType, property?: Property) {
        this.type = type
        if (property) {
            this.property = property
        }
    }
}
