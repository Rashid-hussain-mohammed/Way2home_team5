import type { MediaType } from "./MediaType"

export interface IMediaFile {
    id: string
    creationDate: Date
    type: MediaType
    propertyId?: string
}
