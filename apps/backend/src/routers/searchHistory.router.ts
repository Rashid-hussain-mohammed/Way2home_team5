import express from "express"
import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import { DB } from "@/db"
import { SearchHistoryV2 } from "../entities/SearchHistory"
import { User } from "../entities/User"
import { authenticateToken } from "@/middlewares/auth.middleware"
import { PropertyStatus } from "@gdsd/common/models"

const router = express.Router()

router.use(authenticateToken)

// Add a new search to the history
router.post("/", async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }

    const { query, location, type, maxRent, status, minRent, deposit, availabilityFrom, availabilityTo, size, maxSize, minSize, arePetsAllowed, searchPreferencesId, amenitiesValues } = req.body
    const { user } = req

    if (!query) {
        res.status(400).json({ success: false, message: "Search query is required." })
        return
    }

    try {
        const currentUser = await DB.em.findOne(User, { id: user?.userId })
        if (!currentUser) {
            res.status(404).json({ success: false, message: "User not found." })
            return
        }

        // Check for existing search
        const existingSearch = await DB.em.findOne(SearchHistoryV2, {
            user: currentUser,
            query,
            location: location ?? "", // Using nullish coalescing for clarity
            type: type ?? null, // Using enum instead of hardcoded string
            status: status ?? PropertyStatus.Pending, // Using enum for status
            maxRent: maxRent ?? null, // Null indicates "no value provided"
            minRent: minRent ?? null,
            deposit: deposit ?? null,
            availabilityFrom: availabilityFrom ?? null, //  Avoiding setting new Date() if not provided
            availabilityTo: availabilityTo ?? null,
            minSize: minSize ?? null,
            maxSize: maxSize ?? null,
            arePetsAllowed: arePetsAllowed ?? null, //  Default to false explicitly
            searchPreferencesId: searchPreferencesId ?? null
            // amenitiesValues: amenitiesValues ?? []
        })

        if (existingSearch) {
            res.status(200).json({ success: true, message: "Search history already exists.", data: existingSearch })
            return
        }

        // Create new search history if no duplicate exists
        const searchHistory = DB.em.create(SearchHistoryV2, {
            user: currentUser,
            query,
            location: location ?? "", // Using nullish coalescing for clarity
            type: type ?? null, // Using enum instead of hardcoded string
            status: status ?? PropertyStatus.Pending, // Using enum for status
            maxRent: maxRent ?? null, // Null indicates "no value provided"
            minRent: minRent ?? null,
            deposit: deposit ?? null,
            availabilityFrom: availabilityFrom ?? null, //  Avoiding setting new Date() if not provided
            availabilityTo: availabilityTo ?? null,
            minSize: minSize ?? null,
            maxSize: maxSize ?? null,
            arePetsAllowed: arePetsAllowed ?? null, //  Default to false explicitly
            searchPreferencesId,
            amenitiesValues: amenitiesValues ?? []
        })


        await DB.em.persistAndFlush(searchHistory)

        res.status(201).json({
            sucess: true,
            message: "Search history added successfully.",
            data: searchHistory
        })
    }
    catch (error) {
        console.error("Error saving search history:", error)
        res.status(500).json({ success: false, message: "Internal server error." })
    }
})

// Get the last five search history entries for the logged-in user
router.get("/", async (req: Request, res: Response): Promise<void> => {
    const { user } = req

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }

    try {
        const currentUser = await DB.em.findOne(User, { id: user?.userId })
        if (!currentUser) {
            res.status(404).json({ success: false, message: "User not found." })
            return
        }

        const searchHistory = await DB.em.find(
            SearchHistoryV2,
            { user: currentUser },
            {
                orderBy: { creationDate: "DESC" },
                limit: 5
            }
        )
        console.log(searchHistory)

        if (!searchHistory.length) {
            res.status(404).json({ success: false, message: "No search history found for this user." })
            return
        }

        res.status(200).json({
            success: true,
            data: searchHistory
        })
    }
    catch (error) {
        console.error("Error fetching search history:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error."
        })
    }
})

// Delete a specific search history entry
router.delete("/:id", async (req: Request, res: Response) => {
    const { id } = req.params
    const { user } = req

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }

    try {
        const currentUser = await DB.em.findOne(User, { id: user?.userId })
        if (!currentUser) {
            res.status(404).json({ success: false, message: "User not found." })
            return
        }

        const searchHistory = await DB.em.findOne(SearchHistoryV2, {
            id,
            user: currentUser
        })

        if (!searchHistory) {
            res.status(404).json({ success: false, message: "Search history record not found." })
            return
        }

        await DB.em.removeAndFlush(searchHistory)

        res.status(200).json({
            sucess: true,
            message: "Search history record deleted successfully.",
            searchHistory
        })
    }
    catch (error) {
        console.error("Error deleting search history:", error)
        res.status(500).json({ success: false, message: "Internal server error." })
    }
})

export const searchHistoryRouter = router
