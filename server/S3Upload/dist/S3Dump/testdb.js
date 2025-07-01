"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/lib/prisma"));
require("dotenv/config");
const user = prisma_1.default.user.findMany();
user.then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});
