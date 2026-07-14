import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import { User } from "@/entities"
import { tryParseEnv } from "@gdsd/common/util"

tryParseEnv()
const JWT_SECRET: string | undefined = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined")
}

type JWTUserPayload = {
    userId: string
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTUserPayload
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers["authorization"]?.split(" ")[1]

    if (!token) {
        res.status(401).json({ error: "Access denied. No token provided" })
        return
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." })
        }

        // req.user = decoded as User;
        req.user = decoded as JWTUserPayload
        console.log("User:", req.user)

        next()
    })
}
