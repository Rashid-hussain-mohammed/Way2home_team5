import type { IProperty, IUser } from "."

export interface IFavoriteProperty {
    id: string
    student: IUser
    property: IProperty
    creationDate: Date
}
