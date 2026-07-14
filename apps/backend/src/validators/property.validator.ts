import { body } from "express-validator"
import { PropertyType } from "@gdsd/common/models"

export const validateProperty = (isPatch = false) => [
    body("landlordId")
        .if(() => !isPatch).exists({ checkFalsy: true }).withMessage("LandlordId is required.")
        .isString().withMessage("LandlordId must be a valid string."),

    body("name")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("Name is required.")
            }

            if (value && typeof value !== "string") {
                throw new Error("Name must be a valid string.")
            }

            return true
        }),

    body("type")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("Type is required.")
            }

            if (value && typeof value !== "string") {
                throw new Error("Type must be a valid string.")
            }

            if (value && !Object.values(PropertyType).includes(value)) {
                throw new Error("Type must be one of 'Apartment', 'House', 'SharedApartment', 'SharedHouse'.")
            }

            return true
        }),

    body("coldRent")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("coldRent is required.")
            }
            return true
        })
        .if(value => value !== undefined)
        .isFloat({ min: 0 }).withMessage("Cold rent must be a positive number."),

    body("additionalCosts")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("additionalCosts is required.")
            }
            return true
        })
        .if(value => value !== undefined)
        .isFloat({ min: 0 }).withMessage("Additional costs must be a positive number."),

    body("deposit")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("deposit is required.")
            }
            return true
        })
        .if(value => value !== undefined)
        .isFloat({ min: 0 }).withMessage("Deposit must be a positive number."),

    body("availabilityFrom")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("availabilityFrom is required.")
            }
            return true
        })
        .if(value => value !== undefined)
        .isISO8601().withMessage("Invalid availabilityFrom date.")
        .custom((value, { req }) => {
            if (req.body.availabilityTo && new Date(value) > new Date(req.body.availabilityTo)) {
                throw new Error("availabilityFrom must be before availabilityTo.")
            }
            return true
        }),

    body("availabilityTo")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("availabilityTo is required.")
            }
            return true
        })
        .if(value => value !== undefined)
        .isISO8601().withMessage("Invalid availabilityTo date."),

    body("size")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("Size must be a positive number greater than 0."),

    body("arePetsAllowed")
        .optional()
        .isBoolean().withMessage("arePetsAllowed must be a boolean."),

    body("mediaFileIds")
        .optional()
        .isArray().withMessage("mediaFileIds must be an array.")
        .custom((value: string[]) => {
            if (value.some(id => typeof id !== "string")) {
                throw new Error("Each mediaFileId must be a string.")
            }
            return true
        }),

    body("location")
        .custom((value) => {
            if (!isPatch && !value) {
                throw new Error("location is required.")
            }
            return true
        })
        .if(value => value !== undefined)
        .isString().withMessage("Location must be a valid string."),

    body("description")
        .optional()
        .isString().withMessage("Description must be a valid string."),

    body("landlordQuestionnaireId")
        .optional({ values: "falsy" })
        .isString().withMessage("Landlord Questionnaire ID must be valid."),

    body("isHidden")
        .optional()
        .isBoolean().withMessage("isHidden must be a boolean."),

    body("amenitiesValues")
        .optional()
        .isArray().withMessage("amenitiesValues must be an array.")
        .custom((value: any[]) => {
            if (value.some(item => typeof item.amenityId !== "string" || !["yes", "no"].includes(item.value))) {
                throw new Error("Each item in amenitiesValues must have a valid amenityId (string) and value ('yes' or 'no').")
            }
            return true
        })
]
