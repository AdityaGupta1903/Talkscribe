import { Worker } from 'bullmq';
import { MergeAndUpload } from '../Worker';

const myFirstWorker = new Worker('MergetheVideo', async (job) => {
    let { vid, BucketKey } = job.data
    await MergeAndUpload(BucketKey);
}, { connection: { host: "localhost", port: 6379, maxRetriesPerRequest: null } })
