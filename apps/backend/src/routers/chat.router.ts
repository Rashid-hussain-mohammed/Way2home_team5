import type { Request, Response } from "express"
import express from "express"
import { DB } from "@/db"
import { param, validationResult } from "express-validator"
import type { IChat } from "@gdsd/common/models"
import { getChatId } from "@/chat"
import { authenticateToken } from "@/middlewares/auth.middleware"


const router = express.Router()
router.use(authenticateToken)

// get all chats for one user
router.get(
    "/",
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            })
            return
        }

        const currentUserId = req.user!.userId

        const messages = await DB.messages.findAll({
            orderBy: {
                creationDate: 1
            },
            where: {
                $or: [
                    {
                        sender: currentUserId
                    },
                    {
                        receiver: currentUserId
                    }
                ]
            },
            populate: ["property", "sender", "receiver"]
        })

        const chatIds: string[] = []
        const chats: IChat[] = []

        for (const message of messages) {
            const { sender, receiver, property } = message
            const chatId = getChatId(property.id, [sender.id, receiver.id])
            const otherUser = sender.id == currentUserId ? receiver : sender

            const isUnread = !message.isReadByReceiver && message.receiver.id == currentUserId

            const index = chats.findIndex(e => e.otherUser.id == otherUser.id && e.property.id == property.id)
            if (index >= 0) {
                chats[index]!.messages.push(message)
                if (isUnread)
                    chats[index]!.unreadCount++
            }
            else {
                chatIds.push(chatId)
                chats.push({
                    property,
                    otherUser,
                    messages: [message],
                    unreadCount: isUnread ? 1 : 0
                })
            }
        }

        res.status(200).json({
            success: true,
            data: {
                chats
            }
        })
    }
)


router.get(
    "/:otherUserId/:propertyId",
    [
        param("otherUserId").isString(),
        param("propertyId").isString()
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            })
            return
        }

        const currentUserId = req.user!.userId
        const {
            otherUserId,
            propertyId
        } = req.params

        const otherUser = await DB.users.findOne({ id: otherUserId })
        if (!otherUser) {
            res.status(400).json({
                success: false,
                errors: `user with id ${otherUserId} not found in db`
            })
            return
        }

        const property = await DB.properties.findOne({ id: propertyId })
        if (!property) {
            res.status(400).json({
                success: false,
                errors: `property with id ${propertyId} not found in db`
            })
            return
        }

        const messages = await DB.messages.findAll({
            orderBy: {
                creationDate: 1
            },
            where: {
                $or: [
                    {
                        sender: currentUserId,
                        receiver: otherUserId
                    },
                    {
                        sender: otherUserId,
                        receiver: currentUserId
                    }
                ],
                property: propertyId
            },
            populate: ["property", "sender", "receiver"]
        })

        const unreadCount = await DB.messages.count({
            receiver: currentUserId,
            sender: otherUserId,
            property: propertyId,
            isReadByReceiver: false
        })

        res.status(200).json({
            success: true,
            data: {
                property,
                otherUser,
                messages,
                unreadCount
            } satisfies IChat
        })
    }
)

router.post(
    "/:otherUserId/:propertyId/read",
    [
        param("otherUserId").isString(),
        param("propertyId").isString()
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            })
            return
        }

        const currentUserId = req.user!.userId

        const {
            otherUserId,
            propertyId
        } = req.params

        const otherUser = await DB.users.findOne({ id: otherUserId })
        if (!otherUser) {
            res.status(400).json({
                success: false,
                errors: `user with id ${otherUserId} not found in db`
            })
            return
        }

        const property = await DB.properties.findOne({ id: propertyId })
        if (!property) {
            res.status(400).json({
                success: false,
                errors: `property with id ${propertyId} not found in db`
            })
            return
        }

        await DB.messages.nativeUpdate({
            sender: otherUserId,
            receiver: currentUserId,
            property
        }, { isReadByReceiver: true })

        res.status(200).json({
            success: true
        })
    }
)

router.get(
    "/unread",
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            })
            return
        }

        const currentUserId = req.user!.userId

        const unreadCount = await DB.messages.count({
            receiver: currentUserId,
            isReadByReceiver: false
        })

        res.status(200).json({
            success: true,
            data: {
                unreadCount
            }
        })
    }
)


export const chatRouter = router
