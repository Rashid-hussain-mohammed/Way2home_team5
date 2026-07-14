import type { Request, Response, NextFunction } from "express"
import express from "express"
import { DB } from "@/db"
import { authenticateToken } from "@/middlewares/auth.middleware"

const router = express.Router()

router.use(authenticateToken)

const authorizeModerator = (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: "Unauthorized: User not authenticated" })
            }

            const user = await DB.users.findOne({ id: req.user.userId })

            if (!user) {
                return res.status(404).json({ success: false, error: "User not found" })
            }

            if (user.role !== "Moderator") {
                return res.status(403).json({ success: false, error: "Forbidden: User is not a moderator" })
            }

            next()
        }
        catch (error) {
            console.error("Error authorizing moderator:", error)
            res.status(500).json({ success: false, error: "Internal Server Error" })
        }
    })()
}

router.use(authorizeModerator)

router.get("/most-favorited", async (req: Request, res: Response): Promise<void> => {
    try {
        const mostFavoritedProperties = await DB.em.getConnection().execute(`
            SELECT fp.property_id AS propertyId, COUNT(fp.id) AS favoriteCount, p.*
            FROM favorite_property AS fp
            LEFT JOIN property AS p ON fp.property_id = p.id
            GROUP BY fp.property_id
            ORDER BY favoriteCount DESC
            LIMIT 3
        `)

        res.status(200).json({
            success: true,
            data: mostFavoritedProperties
        })
    }
    catch (error) {
        console.error("Error fetching most favorited properties:", error)
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
})


router.get("/most-applied", async (req: Request, res: Response) => {
    try {
        const topProperties = await DB.em.getConnection().execute(`
            SELECT tq.property_id, COUNT(tq.property_id) AS applicationCount, p.*
            FROM tenant_questionnaire AS tq
            INNER JOIN property AS p ON tq.property_id = p.id
            GROUP BY tq.property_id
            ORDER BY applicationCount DESC
            LIMIT 3
        `)

        res.status(200).json({ success: true, data: topProperties })
    }
    catch (error) {
        console.error("Error fetching top properties:", error)
        res.status(500).json({ success: false, error: "Internal Server Error" })
    }
})

router.get("/most-visited", async (req: Request, res: Response) => {
    try {
        const mostVisited = await DB.properties.createQueryBuilder("p")
            .select(["p.id", "p.name", "p.location", "p.warmRent", "p.coldRent", "p.additionalCosts", "p.deposit", "p.availabilityFrom", "p.availabilityTo", "p.size", "p.arePetsAllowed", "p.landlordQuestionnaireId", "p.visits"]) // Select all needed property fields, including visits
            .orderBy({ visits: "DESC" })
            .limit(3)
            .getResultList()

        res.status(200).json({ success: true, data: mostVisited })
    }
    catch (error) {
        console.error("Error fetching most visited properties:", error)
        res.status(500).json({ success: false, error: "Internal Server Error" })
    }
})

router.get("/property-counts", async (req: Request, res: Response) => {
    try {
        const propertyCounts: { status: string, count: string }[] = await DB.em.getConnection().execute(`
            SELECT status, COUNT(id) AS count
            FROM property
            GROUP BY status
        `)

        const counts: { [key: string]: number } = {}
        propertyCounts.forEach((item: { status: string, count: string }) => {
            counts[item.status] = parseInt(item.count)
        })

        res.status(200).json({ success: true, data: counts })
    }
    catch (error) {
        console.error("Error fetching property counts:", error)
        res.status(500).json({ success: false, error: "Internal Server Error" })
    }
})

router.get("/user-counts", async (req: Request, res: Response) => {
    try {
        const userCounts: { role: string, count: string }[] = await DB.em.getConnection().execute(`
            SELECT role, COUNT(id) AS count
            FROM user
            GROUP BY role
        `)

        const counts: { [key: string]: number } = {}
        userCounts.forEach((item: { role: string, count: string }) => {
            counts[item.role] = parseInt(item.count)
        })

        res.status(200).json({ success: true, data: counts })
    }
    catch (error) {
        console.error("Error fetching user counts:", error)
        res.status(500).json({ success: false, error: "Internal Server Error" })
    }
})


export const insightsRouter = router
