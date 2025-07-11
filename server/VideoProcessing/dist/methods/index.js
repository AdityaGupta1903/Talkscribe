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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRecordingUrlToDb = void 0;
require("dotenv/config");
const prisma_1 = __importDefault(require("../db/lib/prisma"));
const AddRecordingUrlToDb = (fileurl, vid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let UpdateUrl = yield prisma_1.default.recordings.update({
            where: {
                Id: vid,
            },
            data: {
                Processed: true,
                PublicUrl: fileurl,
                Date: new Date(),
            }
        });
        if (UpdateUrl) {
            console.log("Merged Video Uploaded Successfully");
            return UpdateUrl.Id;
        }
    }
    catch (err) {
        console.log(err);
        return -1;
    }
});
exports.AddRecordingUrlToDb = AddRecordingUrlToDb;
