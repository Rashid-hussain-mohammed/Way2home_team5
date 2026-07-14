import type { Server } from "socket.io"
import type { IMessage } from "@gdsd/common/models"
import { CHAT_HEADER } from "@gdsd/common/constants"
import { DB } from "./db"

export function getChatId(propertyId: string, users: string[]): string {
    return `${propertyId}-${users.toSorted().join("-")}`
}

export function useChat(io: Server) {
    io.on("connection", (socket) => {
        const userId = socket.handshake.headers[CHAT_HEADER] as string

        console.log("New user connected:", userId)

        socket.on("message", (message: IMessage) => {
            console.log(`Received message from user: ${JSON.stringify(message)}`)

            const propertyId = message.property as string
            const receiverId = message.receiver as string

            DB.messages.create({
                ...message,
                property: propertyId
            })
            DB.em.flush()

            io.to(receiverId).emit("message", message)
        })

        socket.on("disconnect", () => {
            console.log("User disconnected:", userId)
        })

        socket.join(userId)
    })
}
