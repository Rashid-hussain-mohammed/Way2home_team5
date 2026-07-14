import type { IProperty, IUser } from "."

export interface IMessage {
    id: string
    creationDate: Date
    content: string
    sender: IUser | string
    receiver: IUser | string
    property: IProperty | string
    isReadByReceiver: boolean
}
