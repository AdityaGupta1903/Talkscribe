"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const AWS = __importStar(require("aws-sdk"));
require("dotenv/config");
AWS.config.update({ region: "us-west-2" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const CleanUpS3Bucket = (BucketKey, Prefix) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /// list down all S3 Bucket Keys
        let ProcessDeleting = s3.listObjectsV2({ Bucket: BucketKey, Prefix: Prefix }, (err, list) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (err) {
                console.error("Error listing S3 objects:", err);
                return;
            }
            let deletedKeys = [];
            if ((_a = list.Contents) === null || _a === void 0 ? void 0 : _a.length) {
                for (let i = 0; i < list.Contents.length; i++) {
                    let key = list.Contents[i].Key;
                    if (key) {
                        deletedKeys.push({ Key: key });
                    }
                }
            }
            let deleteFromS3 = s3.deleteObjects({
                Bucket: BucketKey,
                Delete: {
                    Objects: deletedKeys,
                    Quiet: false
                }
            }, (err, data) => {
                if (err) {
                    console.log("Error In deleting the data");
                    console.log(err);
                }
                console.log(data.Deleted);
            }).promise();
            yield deleteFromS3;
        })).promise();
        yield ProcessDeleting;
    }
    catch (err) {
    }
});
CleanUpS3Bucket("talkscribe-buffer", "79ec743b-930a-4fa9-a2bd-d5d68ecb1cee:58662627-ec58-420a-a8a8-f16a262ad6e5-3/");
