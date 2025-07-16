"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myQueue = void 0;
const bullmq_1 = require("bullmq");
exports.myQueue = new bullmq_1.Queue('MergeVideo', {
    connection: {
        host: process.env.Environment == "DEV" ? "localhost" : "redis",
        port: 6379
    }
});
