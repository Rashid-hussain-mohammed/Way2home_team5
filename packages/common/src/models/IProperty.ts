import type { IUser, PropertyStatus, PropertyType } from "."

export interface IProperty {
    id: string
    creationDate: Date
    reviewDate?: Date
    renewalDate?: Date
    landlord: IUser
    name: string
    location: string
    description?: string
    type: PropertyType // Enum for property type (Apartment, House, etc.)
    status: PropertyStatus // Enum for property status (Pending, Active, etc.)
    coldRent: number
    additionalCosts: number
    warmRent: number // This can be computed as coldRent + additionalCosts
    deposit: number
    availabilityFrom: Date
    availabilityTo: Date
    size?: number // Size of the property in square meters (optional)
    arePetsAllowed?: boolean // Whether pets are allowed (optional)
    landlordQuestionnaireId?: string // Storing the ID of the questionnaire (optional)
    amenitiesValues?: { amenityId: string, value: "yes" | "no" }[] // Array to store the amenities selected by the customer (yes/no)
}
