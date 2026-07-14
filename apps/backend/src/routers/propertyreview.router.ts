import type { Request, Response } from "express"
import express from "express"
import { validationResult, query, param, body } from "express-validator"
import { DB } from "@/db"
import { authenticateToken } from "@/middlewares/auth.middleware"


const router = express.Router()

router.get(
    "/property",
    authenticateToken,
    [
        query("query").optional().isString().withMessage("query must be a string"),
        query("propertyStatus").optional().isString().withMessage("Status must be an enum")
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

            const { query, propertyStatus } = req.query


            let qb = DB.properties.createQueryBuilder("p").select("*")


            if (query) {
                const textQuery = new RegExp(`.*${query}.*`)
                qb = qb.where({
                    $or: [
                        { location: textQuery },
                        { name: textQuery },
                        { description: textQuery }
                    ]
                })
            }

            if (propertyStatus) {
                qb = qb.andWhere({
                    status: propertyStatus
                })
            }

            qb = qb.leftJoinAndSelect("p.mediaFiles", "mediaFiles")
                .leftJoinAndSelect("p.landlord", "landlord")


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


router.put(
    "/property/:propertyId",
    authenticateToken,
    [param("propertyId").isUUID().withMessage("Invalid property ID format"),
        body("status")
            .isString()
            .isIn(["Approved", "Rejected"])
            .withMessage("Status must be 'Approved' or 'Rejected'.")],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
        }

        const { propertyId } = req.params
        const { status } = req.body

        try {
            // Fetch the property by ID
            const property = await DB.properties.findOne({ id: propertyId })

            // If property is not found, return 404
            if (!property) {
                res.status(404).json({ error: "Property not found." })
            }

            const reviewDate = new Date()

            // Update the status
            await DB.properties.nativeUpdate({ id: propertyId }, { status: status, reviewDate: reviewDate })

            // Send the updated property as a response
            res.status(200).json({ ...property, status: status, reviewDate: reviewDate })
        }
        catch (error) {
            console.error("Error updating property status:", error)
            res.status(500).json({ error: "An error occurred while updating the property status." })
        }
    }
)


export const propertyReviewRouter = router
