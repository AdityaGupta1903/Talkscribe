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
exports.MergeAndUpload = void 0;
require("dotenv/config");
const AWS = __importStar(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const MergeAndUpload = (BucketKey) => __awaiter(void 0, void 0, void 0, function* () {
    // Configure AWS
    AWS.config.update({ region: "us-west-2" });
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    const BUCKET = "talkscribe-buffer";
    const PREFIX = BucketKey + "/";
    s3.listObjectsV2({ Bucket: BUCKET, Prefix: PREFIX }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (err) {
            console.error("Error listing S3 objects:", err);
            return;
        }
        const contents = ((_a = data.Contents) === null || _a === void 0 ? void 0 : _a.filter((item) => item.Key && item.Key !== PREFIX)) || []; /// Fetches the Key
        const paths = [];
        createFolderAsync("TempSavedVideo"); /// If the Folder Doesn't Exist 
        for (const [index, fileObj] of contents.entries()) {
            const Key = fileObj.Key;
            console.log(`Downloading: ${Key}`);
            try {
                const fileData = yield s3.getObject({ Bucket: BUCKET, Key }).promise();
                if (fileData.Body) {
                    const filePath = `./TempSavedVideo/file-${index}.webm`; //
                    paths.push(filePath);
                    fs_1.default.writeFileSync(filePath, fileData.Body);
                    console.log(`Saved to: ${filePath}`);
                }
            }
            catch (err) {
                console.error(`Failed to download ${Key}:`, err);
            }
        }
        let merged = (0, fluent_ffmpeg_1.default)();
        paths.forEach(video => {
            merged = merged.input(video);
        });
        let promise = new Promise((res, rej) => {
            merged
                .on('error', (err) => console.error('Error:', err))
                .on('end', () => {
                console.log('Merging complete!');
            })
                .mergeToFile(`output.mp4`, './tmp');
            res();
        });
        yield promise;
        yield CleanUpS3Bucket(BucketKey, PREFIX);
        console.log("Download complete.");
    }));
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
            console.log("Error in deleting the objects from the bucket", err);
        }
    });
    /// Creating Folder Logic and CleanUp Last Video
    function createFolderAsync(folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.default.existsSync("output.mp4")) {
                fs_1.default.unlinkSync("output.mp4");
            }
            if (!fs_1.default.existsSync(folderName)) {
                fs_1.default.mkdirSync(folderName);
                console.log(`Folder '${folderName}' created successfully.`);
            }
            else {
                fs_1.default.rmdirSync(folderName, { recursive: true }); // delete the folder if exists and create the new one
                fs_1.default.mkdirSync(folderName);
            }
        });
    }
    function CleanUp(folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.default.existsSync(folderName)) {
                fs_1.default.rmdirSync(folderName, { recursive: true }); // delete the folder if exists and create the new one
            }
            if (fs_1.default.existsSync("output.mp4")) {
                fs_1.default.unlinkSync("output.mp4");
            }
        });
    }
    function MergedVideo(Bucket, filepath, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filstream = fs_1.default.createReadStream(filepath);
                let S3Upload = yield s3.upload({
                    Bucket: Bucket,
                    Key: filename + ".mp4",
                    Body: filstream
                }).promise();
                console.log(S3Upload.Location);
            }
            catch (err) {
                console.log("Error in Uploading the merged video", err);
            }
        });
    }
});
exports.MergeAndUpload = MergeAndUpload;
