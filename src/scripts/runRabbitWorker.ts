import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

import { runRabbitWorker } from '@/workers/analyticsRabbitWorker';

runRabbitWorker()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
