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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const AWS = __importStar(require("aws-sdk"));
AWS.config.update({ region: "us-west-2" });
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const bucketName = "testbuket-s3-arn-1452555-xya/test-folder-name-from-cli";
const folderName = "test-folder-name-from-cli2/"; // The trailing slash is crucial for S3 to recognize it as a folder
var bucketParams = {
    Bucket: bucketName,
    Key: folderName,
    Body: "",
};
s3.putObject(bucketParams, (err, data) => {
    if (err) {
        console.error("Error creating folder:", err);
    }
    else {
        console.log("Folder created successfully:", data);
    }
});
// To Create the bucket
// var bucketParams = {
//   Bucket: "testbuket-s3-arn-1452555-xya",
// };
// // Call S3 to list the buckets
// s3.createBucket(bucketParams, function (err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data.Location);
//   }
// });
