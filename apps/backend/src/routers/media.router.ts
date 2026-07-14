import express from "express"
import { BlobStorage } from "@/blob-storage.js"
import formidable from "formidable"
import { DB } from "../db"
import { MediaType } from "@gdsd/common/models"
import { MediaFile } from "../entities"
import { authenticateToken } from "@/middlewares/auth.middleware"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const router = express.Router()

router.post("/", authenticateToken, async (req, res, next) => {
    const form = formidable()

    form.parse(req, async (err, _, files) => {
        if (err) {
            next(err)
            return
        }

        if (files.file?.length != 1) {
            res.status(400)
            return
        }

        const file = files.file[0]!

        if (file.size > MAX_FILE_SIZE) {
            res.status(400).json({ error: `Maximum file size (${MAX_FILE_SIZE}) exceeded: ${file.size}` })
            return
        }

        const type = MediaType.Image
        const entity = new MediaFile(type)
        await DB.mediaFiles.insert(entity)
        await DB.em.flush()

        const mimeType = file.mimetype ?? "application/octet-stream"
        await BlobStorage.upload(entity.id, file.filepath, mimeType)
        res.json(entity)
    })
})

router.get("/:id", async (req, res) => {
    const { buffer, mimeType } = await BlobStorage.get(req.params.id)
    res.setHeader("content-type", mimeType)
    res.end(buffer)
})

export const mediaRouter = router
