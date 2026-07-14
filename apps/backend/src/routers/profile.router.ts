import type { Request, Response } from "express"
import express from "express"
import { validationResult, param, body } from "express-validator"
import { DB } from "@/db"
import { authenticateToken } from "@/middlewares/auth.middleware"
const router = express.Router()
router.get(
    "/:id",
    authenticateToken,
    param("id").isUUID().withMessage("Invalid user ID format"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() })
                return
            }
            const { id } = req.params
            if (!id) {
                res.status(400).json({ success: false, error: "User ID is required." })
                return
            }
            const user = await DB.users.findOne(id)
            if (!user) {
                res.status(404).json({ success: false, error: "Profile not found." })
                return
            }
            res.status(200).json({
                success: true,
                data: user
            })
        }
        catch (error: unknown) {
            console.error("Error fetching profile:", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
)

router.put(
    "/:id",
    authenticateToken,
    [
        param("id").isUUID().withMessage("Invalid user ID format"),
        body("firstName").optional().isString().withMessage("First name must be a string"),
        body("lastName").optional().isString().withMessage("Last name must be a string"),
        body("email").optional().isEmail().withMessage("Invalid email format"),
        body("gender")
            .optional()
            .isIn(["Male", "Female", "Other"])
            .withMessage("Gender must be one of 'Male', 'Female', or 'Other'"),
        body("birthDate")
            .optional()
            .isISO8601()
            .toDate()
            .withMessage("Birth date must be a valid date in ISO8601 format"),
        body("phone").optional().isString().withMessage("Phone must be a string"),
        body("about").optional().isString().withMessage("About must be a string")
    ],
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() })
                return
            }


            const { id } = req.params
            const updates = req.body


            if (!id) {
                res.status(400).json({ success: false, error: "User ID is required." })
                return
            }


            const user = await DB.users.findOne(id)


            if (!user) {
                res.status(404).json({ success: false, error: "User not found." })
                return
            }


            // Update the user's details
            await DB.users.nativeUpdate(id, updates)


            res.status(200).json({
                success: true,
                message: "User details updated successfully.",
                data: { ...user, ...updates }
            })
        }
        catch (error: unknown) {
            console.error("Error updating user details:", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
)


export const profileRouter = router
