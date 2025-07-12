import { Worker } from 'bullmq';
import { MergeAndUpload } from '../Worker';

const myFirstWorker = new Worker('MergeVideo', async (job) => {
    let { vid, BucketKey } = job.data
    await MergeAndUpload(BucketKey, vid);
}, { connection: { host: "redis", port: 6379, maxRetriesPerRequest: null } })
