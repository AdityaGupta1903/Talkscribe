import { Queue } from 'bullmq';


export const myQueue = new Queue('MergeVideo', {
    connection: {
        host: process.env.Environment == "DEV" ? "localhost" : "redis",
        port: 6379
    }
});

