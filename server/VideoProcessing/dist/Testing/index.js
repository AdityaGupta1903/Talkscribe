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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const AWS = __importStar(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
// Configure AWS
AWS.config.update({ region: "us-west-2" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const BUCKET = "testbuket-s3-arn-1452555-xya";
const PREFIX = "test-folder-name-from-cli/";
s3.listObjectsV2({ Bucket: BUCKET, Prefix: PREFIX }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (err) {
        console.error("Error listing S3 objects:", err);
        return;
    }
    const contents = ((_a = data.Contents) === null || _a === void 0 ? void 0 : _a.filter((item) => item.Key && item.Key !== PREFIX)) || [];
    for (const [index, fileObj] of contents.entries()) {
        const Key = fileObj.Key;
        console.log(`Downloading: ${Key}`);
        try {
            const fileData = yield s3.getObject({ Bucket: BUCKET, Key }).promise();
            if (fileData.Body) {
                const filePath = `./file-${index}.webm`; // You can customize filename
                fs_1.default.writeFileSync(filePath, fileData.Body);
                console.log(`Saved to: ${filePath}`);
            }
        }
        catch (err) {
            console.error(`Failed to download ${Key}:`, err);
        }
    }
    console.log("Download complete.");
}));
