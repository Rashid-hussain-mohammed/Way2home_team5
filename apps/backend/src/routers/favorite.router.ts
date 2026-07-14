import express from "express"
import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import { DB } from "@/db"
import { FavoriteProperty } from "../entities/FavoriteProperty"
import { User } from "../entities/User"
import { Property } from "../entities/Property"
import { authenticateToken } from "@/middlewares/auth.middleware"

const router = express.Router()

router.use(authenticateToken)


router.post(
    "/:propertyId",
    async (req: Request, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
            return
        }

        const { propertyId } = req.params
        const { user } = req
        console.log("Authenticated user:", req.user)


        try {
            const student = await DB.em.findOne(User, { id: user?.userId })
            if (!student) {
                res.status(404).json({ error: "Student not found." })
                return
            }

            const property = await DB.em.findOne(Property, { id: propertyId })
            if (!property) {
                res.status(404).json({ error: "Property not found." })
                return
            }

            const existingFavorite = await DB.em.findOne(FavoriteProperty, { student, property })
            if (existingFavorite) {
                res.status(400).json({ error: "Property is already in favorites." })
                return
            }

            const favorite = DB.em.create(FavoriteProperty, { student, property, creationDate: new Date() })
            await DB.em.persistAndFlush(favorite)

            res.status(201).json({
                message: "Property added to favorites.",
                favorite: {
                    id: favorite.id,
                    studentId: student.id,
                    propertyId: property.id,
                    creationDate: favorite.creationDate
                }
            })
        }
        catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal server error." })
        }
    }
)

router.get(
    "/",
    async (req: Request, res: Response): Promise<void> => {
        const { user } = req

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
            return
        }

        try {
            const favorites = await DB.em.find(
                FavoriteProperty,
                { student: { id: user?.userId } },
                { populate: ["property", "property.mediaFiles"] }
            )

            if (!favorites.length) {
                res.status(404).json({ success: false, error: "No favorites found for this student." })
                return
            }

            res.status(200).json({
                success: true,
                data: favorites
            })
        }
        catch (error) {
            console.error("Error fetching favorites:", error)
            res.status(500).json({
                success: false,
                error: "Internal server error"
            })
        }
    }
)

router.delete(
    "/:propertyId",
    async (req: Request, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
            return
        }

        const { propertyId } = req.params
        const { user } = req

        try {
            const student = await DB.em.findOne(User, { id: user?.userId })
            if (!student) {
                res.status(404).json({ error: "Student not found." })
                return
            }

            const property = await DB.em.findOne(Property, { id: propertyId })
            if (!property) {
                res.status(404).json({ error: "Property not found." })
                return
            }

            const favorite = await DB.em.findOne(FavoriteProperty, { student, property })
            if (!favorite) {
                res.status(404).json({ error: "Favorite not found." })
                return
            }

            await DB.em.removeAndFlush(favorite)

            res.status(200).json({
                message: "Property removed from favorites.",
                favorite: {
                    id: favorite.id,
                    studentId: student.id,
                    propertyId: property.id,
                    creationDate: favorite.creationDate
                }
            })
        }
        catch (error) {
            console.error(error)
            res.status(500).json({ error: "Internal server error." })
        }
    }
)

export const favoritesRouter = router
