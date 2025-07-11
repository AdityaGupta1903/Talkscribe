"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const Worker_1 = require("../Worker");
const myFirstWorker = new bullmq_1.Worker('MergetheVideo', (job) => __awaiter(void 0, void 0, void 0, function* () {
    let { vid, BucketKey } = job.data;
    yield (0, Worker_1.MergeAndUpload)(BucketKey);
}), { connection: { host: "localhost", port: 6379, maxRetriesPerRequest: null } });
