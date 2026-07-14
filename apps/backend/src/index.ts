import { BlobStorage } from "./blob-storage"
import cors from "cors"
import express from "express"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { tryParseEnv } from "@gdsd/common/util"
import { mediaRouter } from "./routers/media.router"
import { propertyRouter } from "./routers/property.router"
import { amenityRouter } from "./routers/amenity.router"
import { useChat } from "./chat"
import { RequestContext } from "@mikro-orm/mysql"
import { DB, initDatabase } from "./db"
import { questionnaireRouter } from "./routers/questionnaire.router"
import { chatRouter } from "./routers/chat.router"
import { loginRouter } from "./routers/login.router"
import { profileRouter } from "./routers/profile.router"
import { favoritesRouter } from "./routers/favorite.router"
import { propertyReviewRouter } from "./routers/propertyreview.router"
import { insightsRouter } from "./routers/insights.router"
import { searchHistoryRouter } from "./routers/searchHistory.router" // Add search history router

tryParseEnv()
const port = process.env["BACKEND_PORT"]
const origin = [
    "http://localhost:3000",
    "https://your-production-domain.com"
]

;(async () => {
    // initialize s3 & db
    await BlobStorage.init()
    await initDatabase()

    const app = express()
    const server = createServer(app)
    const io = new Server(server, {
        cors: { origin }
    })

    useChat(io)

    app.use(cors({ origin }))
    app.use(express.json())
    app.use(express.static("public"))

    // Request context for MikroORM
    app.use((_req, _res, next) => {
        RequestContext.create(DB.em, next)
    })


    // Use routers
    app.use("/media", mediaRouter)
    app.use("/properties", propertyRouter)
    app.use("/amenity", amenityRouter)
    app.use("/questionnaire", questionnaireRouter)
    app.use("/chat", chatRouter)
    app.use("/auth", loginRouter)
    app.use("/profile", profileRouter)
    app.use("/review", propertyReviewRouter)
    app.use("/favorites", favoritesRouter)
    app.use("/insights", insightsRouter)
    app.use("/search-history", searchHistoryRouter) // Add search history router

    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })
})()
