// src/scripts/runAnalyticsWorker.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

import { runAnalyticsWorker } from '@/workers/analyticsWorker';

runAnalyticsWorker()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
