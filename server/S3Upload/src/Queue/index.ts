import { Queue } from 'bullmq';


export const myQueue = new Queue('foo', {
    connection: {
        host: "localhost",
        port: 6379
    }
});

async function addJobs() {
    await myQueue.add('myJobName', { foo: 'bar' });
    await myQueue.add('myJobName', { qux: 'baz' });
}

// addJobs().then((res) => {
//     console.log("res", res);
// }).catch((err) => {
//     console.log("err", err);
// })