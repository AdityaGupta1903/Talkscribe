import { Queue } from 'bullmq';


export const myQueue = new Queue('MergeVideo', {
    connection: {
        host: "redis",
        port: 6379
    }
});

