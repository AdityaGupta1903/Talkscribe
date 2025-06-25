import "dotenv/config";
import * as AWS from "aws-sdk";

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
  } else {
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
