import { BlobServiceClient, ContainerClient } from "@azure/storage-blob"

const containerName = "gdsd"
const metadataKeys = {
    MIMETYPE: "mimetype"
}

export class BlobStorage {
    private static client: BlobServiceClient
    private static containerClient: ContainerClient

    static async init() {
        const connectionString = process.env["BLOB_STORAGE"]
        if (!connectionString)
            throw new Error("BLOB_STORAGE environment variable not set")

        // create clients
        BlobStorage.client = BlobServiceClient.fromConnectionString(connectionString)
        BlobStorage.containerClient = BlobStorage.client.getContainerClient(containerName)

        // create container if it does not exist
        await BlobStorage.containerClient.createIfNotExists()
    }

    static async upload(id: string, filePath: string, mimeType: string) {
        const client = BlobStorage.containerClient.getBlockBlobClient(id)
        return await client.uploadFile(filePath, {
            metadata: {
                [metadataKeys.MIMETYPE]: mimeType
            }
        })
    }

    static async get(id: string) {
        const client = BlobStorage.containerClient.getBlockBlobClient(id)
        const properties = await client.getProperties()
        const buffer = await client.downloadToBuffer()
        const mimeType = properties.metadata![metadataKeys.MIMETYPE]!
        return {
            buffer,
            mimeType
        }
    }
}
