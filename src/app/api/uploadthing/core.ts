import { getAuth } from '@/lib/auth-helpers';
import { updateAvatarUrl } from '@/lib/mongodb';

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '1MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await getAuth();
      if (!userId) throw new UploadThingError('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await updateAvatarUrl(metadata.userId!, file.ufsUrl);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
