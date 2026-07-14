import type { IMessage } from "@gdsd/common/models"
import { Entity, ManyToOne, PrimaryKey, Property as Prop } from "@mikro-orm/mysql"
import { v4 } from "uuid"
import { User } from "./User"
import { Property } from "./Property"

@Entity()
export class Message implements IMessage {
    @PrimaryKey({ type: "uuid" })
    id = v4()

    @Prop()
    creationDate = new Date()

    @Prop()
    content!: string

    @ManyToOne(() => Property)
    property!: Property

    @ManyToOne(() => User)
    sender!: User

    @ManyToOne(() => User)
    receiver!: User

    @Prop()
    isReadByReceiver!: boolean
}
