import express from "express"
import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { DB } from "@/db"
import { User } from "../entities/User"
import { loginValidation, signupValidation } from "@/validators/auth.validator"
import { tryParseEnv } from "@gdsd/common/util"

const router = express.Router()

tryParseEnv()
const JWT_SECRET: string | undefined = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined")
}

router.post(
    "/login",
    loginValidation,
    async (req: Request, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
            return
        }

        const { email, password } = req.body
        try {
        const user = await DB.em.findOne(User, { email })


        if (!user) {
            res.status(400).json({ error: "User does not exist!!!" })
            return
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" })
            return
        }

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" })

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        })
        }
        catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal server error." })
        return
    }
  }
)

router.post("/signup", signupValidation, async (req: Request, res: Response) => {
    console.log(req.body)

    const { firstName, lastName, email, password, gender, birthDate, phone, avatar, role, about } = req.body

    const existingUser = await DB.em.findOne(User, { email })

    if (existingUser) {
        res.status(400).json({ error: "Email is already in use!" })
        return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = DB.em.create(User, {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        gender: gender,
        birthDate: birthDate,
        phone: phone,
        creationDate: new Date(),
        avatar: avatar,
        role: role,
        about: about
    })

    await DB.em.persistAndFlush(user)

    res.status(201).json({
        user
    })
})

export const loginRouter = router
