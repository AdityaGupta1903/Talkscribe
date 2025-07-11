import { Queue } from 'bullmq';


export const myQueue = new Queue('uploadqueue', {
    connection: {
        host: "localhost",
        port: 6379
    }
});

