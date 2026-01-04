// src/scripts/runInsightsWorker.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(process.cwd(), '.env.local'),
});

import { runInsightsWorker } from '@/workers/insightsWorker';

console.log('[Script] Starting Insights Worker...');
console.log('[Script] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? '✓ Set' : '✗ Missing'
});

runInsightsWorker()
    .then((stats) => {
        console.log('[Script] Worker completed successfully:', stats);
        process.exit(0);
    })
    .catch(err => {
        console.error('[Script] Worker failed:', err);
        process.exit(1);
    });