import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ host: "locahost", port: 6379, maxRetriesPerRequest: null });

const myFirstWorker = new Worker('foo', async (job) => {
    console.log(job.data);
}, { connection: { host: "localhost", port: 6379 } })
