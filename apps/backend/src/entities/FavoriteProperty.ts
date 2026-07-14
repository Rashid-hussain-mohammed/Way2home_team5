import type { IFavoriteProperty } from "@gdsd/common/models"
import { Entity, PrimaryKey, Property as Prop, ManyToOne } from "@mikro-orm/mysql"
import { v4 } from "uuid"
import { Property } from "./Property"
import { User } from "./User"

@Entity()
export class FavoriteProperty implements IFavoriteProperty {
    @PrimaryKey({ type: "uuid" })
    id = v4()

    @Prop()
    creationDate: Date = new Date()

    @ManyToOne(() => User)
    student!: User

    @ManyToOne(() => Property)
    property!: Property
}
