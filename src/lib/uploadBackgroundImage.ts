import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function uploadBackgroundImage(
    buffer: Buffer,
    userId: string
) {
    // Procesar imagen
    const webp = await sharp(buffer)
        .resize({
            fit: 'cover',
            position: 'attention', // 🔥 magia
        })
        .webp({ quality: 80 })
        .toBuffer();

    const key = `backgrounds/${userId}-${crypto.randomUUID()}.webp`;

    await r2.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: key,
            Body: webp,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000, immutable",
        })
    );

    return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
}
