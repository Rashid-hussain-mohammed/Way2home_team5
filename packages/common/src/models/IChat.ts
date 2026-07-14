import type { IMessage } from "./IMessage"
import type { IProperty } from "./IProperty"
import type { IUser } from "./IUser"

export interface IChat {
    otherUser: IUser
    property: IProperty
    messages: IMessage[]
    unreadCount: number
}
