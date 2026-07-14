import type { Request, Response } from "express"
import express from "express"
import { validationResult, query, param, body } from "express-validator"
import { DB } from "@/db"
import { MediaFile, Property } from "@/entities"
import { validateProperty } from "@/validators"
import { PropertyType, PropertyStatus } from "@gdsd/common/models"
import { authenticateToken } from "@/middlewares/auth.middleware"


const router = express.Router()

router.get(
    "/",
    [
        query("query").optional().isLength({ max: 40 }).isString().withMessage("query must be a string (max 40 characters)"),
        query("location").optional().isString().withMessage("location must be a string"),
        query("minPrice").optional().isNumeric().withMessage("minPrice must be a number"),
        query("maxPrice").optional().isNumeric().withMessage("maxPrice must be a number"),
        query("propertyType").optional().isString().withMessage("propertyType must be a string"),
        query("propertyStatus").optional().isString().withMessage("Status must be an enum"),
        query("arePetsAllowed").optional().isBoolean().withMessage("arePetsAllowed must be a bool"),
        query("availabilityFrom").optional().isISO8601().withMessage("availabilityFrom must be a date"),
        query("availabilityTo").optional().isISO8601().withMessage("availabilityTo must be a date"),
        query("minSize").optional().isNumeric().withMessage("minSize must be a number"),
        query("maxSize").optional().isNumeric().withMessage("maxSize must be a number")
    ],
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array()
                })
                return
            }

            const {
                minPrice,
                maxPrice,
                query,
                location,
                propertyType,
                arePetsAllowed,
                availabilityFrom,
                availabilityTo,
                minSize,
                maxSize,
                propertyStatus
            } = req.query

            let qb = DB.properties.createQueryBuilder("p").select("*").where({})

            if (query) {
                const textQuery = new RegExp(`.*${query}.*`)
                qb = qb.andWhere({
                    $or: [
                        { location: textQuery },
                        { name: textQuery },
                        { description: textQuery }
                    ]
                })
            }

            if (location) {
                const textQuery = new RegExp(`.*${location}.*`)
                qb = qb.andWhere({ location: textQuery })
            }

            if (minPrice) {
                qb = qb.andWhere({
                    warmRent: { $gte: minPrice }
                })
            }

            if (maxPrice) {
                qb = qb.andWhere({
                    warmRent: { $lte: maxPrice }
                })
            }

            if (propertyType) {
                const enumValue = PropertyType[propertyType as keyof typeof PropertyType]
                if (enumValue) {
                    qb = qb.andWhere({ type: enumValue })
                }
                else {
                    console.log("Invalid property type")
                }
            }

            if (arePetsAllowed == "true" || arePetsAllowed == "false") {
                qb = qb.andWhere({
                    arePetsAllowed: arePetsAllowed == "true"
                })
            }

            if (availabilityFrom) {
                qb = qb.andWhere({
                    availabilityFrom: { $lte: availabilityFrom }
                })
            }

            if (availabilityTo) {
                qb = qb.andWhere({
                    availabilityTo: { $gte: availabilityTo }
                })
            }

            if (minSize) {
                qb = qb.andWhere({
                    size: { $gte: minSize }
                })
            }

            if (maxSize) {
                qb = qb.andWhere({
                    size: { $lte: maxSize }
                })
            }

            if (propertyStatus) {
                qb = qb.andWhere({
                    status: propertyStatus
                })
            }

            qb = qb.leftJoinAndSelect("p.mediaFiles", "mediaFiles")

            const properties = await qb.getResultList()

            res.status(200).json({
                success: true,
                data: properties
            })
        }
        catch (error: unknown) {
            console.error("Error fetching properties:", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
)


router.post(
    "/",
    authenticateToken,
    validateProperty(false),
    async (req: Request, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
            return
        }

        const { landlordId, mediaFileIds, ...data } = req.body

        const mediaFiles = await DB.em.find(MediaFile, { id: { $in: mediaFileIds } })

        if (mediaFiles.length !== mediaFileIds.length) {
            res.status(400).json({ error: "Some media files could not be found." })
            return
        }

        const property = DB.properties.create({
            landlord: landlordId,
            ...data
        })
        property.mediaFiles.add(mediaFiles)
        await DB.em.flush()

        res.status(201).json({ property })
    }
)


router.get(
    "/:id",
    param("id").isUUID().withMessage("Invalid property ID format"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() })
                return
            }

            const { id } = req.params

            if (!id) {
                res.status(400).json({ success: false, error: "Property ID is required." })
                return
            }

            const property = await DB.properties.findOne(id, { populate: ["mediaFiles", "landlord"] })

            if (!property) {
                res.status(404).json({ success: false, error: "Property not found." })
                return
            }
            console.log("Visits before increment:", property.visits)
            property.visits = (property.visits ?? 0) + 1
            console.log("Visits after increment:", property.visits)
            await DB.em.flush()

            res.status(200).json({
                success: true,
                data: property
            })
        }
        catch (error: unknown) {
            console.error("Error fetching property by ID:", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
)

router.get(
    "/landlord/:landlordId",
    param("landlordId").isUUID().withMessage("Invalid landlord ID format"),
    authenticateToken,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() })
                return
            }

            const { landlordId } = req.params

            if (!landlordId) {
                res.status(400).json({ success: false, error: "Landlord ID is required." })
                return
            }

            const properties = await DB.properties.find(
                { landlord: landlordId },
                { populate: ["mediaFiles", "landlord"] }
            )

            if (!properties || properties.length === 0) {
                res.status(200).json({ success: true, properties: properties || [] })
                return
            }

            res.status(200).json({
                success: true,
                data: properties
            })
        }
        catch (error: unknown) {
            console.error("Error fetching properties by landlord ID:", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
)

router.patch(
    "/:id",
    authenticateToken,
    [
        param("id").isUUID().withMessage("Invalid property ID format"),
        ...validateProperty(true)
    ],
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array()
                })
                return
            }

            const { id } = req.params

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "Property ID is required."
                })
                return
            }

            const { mediaFileIds, ...data } = req.body

            const property = await DB.properties.findOne(id, { populate: ["mediaFiles", "landlord"] })

            if (!property) {
                res.status(404).json({
                    success: false,
                    error: "Property not found."
                })
                return
            }

            const landlordIdFromToken = req.user?.userId

            if (property.landlord.id !== landlordIdFromToken) {
                res.status(403).json({
                    success: false,
                    error: "You are not authorized to update this property."
                })
                return
            }

            if (property.status === PropertyStatus.Approved) {
                res.status(403).json({
                    success: false,
                    error: "You cannot update a property that has been approved."
                })
                return
            }

            const requiredFields: (keyof Property)[] = [
                "name",
                "type",
                "coldRent",
                "additionalCosts",
                "deposit",
                "availabilityFrom",
                "availabilityTo",
                "location"
            ]

            for (const field of requiredFields) {
                if (data[field] === undefined) {
                    data[field] = property[field]
                }
                else if (data[field] === null || data[field] === "") {
                    res.status(400).json({
                        success: false,
                        error: `${String(field)} cannot be empty.`
                    })
                    return
                }
            }

            property.status = PropertyStatus.Pending

            if (mediaFileIds) {
                const mediaFiles = await DB.em.find(MediaFile, { id: { $in: mediaFileIds } })
                if (mediaFiles.length !== mediaFileIds.length) {
                    res.status(400).json({ success: false, error: "Some media files could not be found." })
                    return
                }
                property.mediaFiles.set(mediaFiles)
            }

            DB.em.assign(property, data)

            await DB.em.flush()

            res.status(200).json({
                success: true,
                data: property
            })
        }
        catch (error: unknown) {
            console.error("Error updating property:", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
)


router.delete(
    "/:id",
    authenticateToken,
    param("id").isUUID().withMessage("Invalid property ID format"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array()
                })
                return
            }

            const { id } = req.params

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "Property ID is required."
                })
                return
            }

            const property = await DB.properties.findOne(id, { populate: ["landlord"] })

            if (!property) {
                res.status(404).json({
                    success: false,
                    error: "Property not found."
                })
                return
            }

            const landlordIdFromToken = req.user?.userId

            if (property.landlord.id !== landlordIdFromToken) {
                res.status(403).json({
                    success: false,
                    error: "You are not authorized to delete this property."
                })
                return
            }

            await DB.em.removeAndFlush(property)

            res.status(200).json({
                success: true,
                message: "Property deleted successfully."
            })
        }
        catch (error: unknown) {
            console.error("Error deleting property:", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
)


export const propertyRouter = router
