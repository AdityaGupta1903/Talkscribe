import { Queue } from 'bullmq';


export const myQueue = new Queue('MergeVideo', {
    connection: {
        host: "localhost",
        port: 6379
    }
});

