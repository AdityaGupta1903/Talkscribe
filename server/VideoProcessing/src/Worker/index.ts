import "dotenv/config";
import * as AWS from "aws-sdk";
import fs from "fs";
import Ffmpeg from "fluent-ffmpeg";
import { AddRecordingUrlToDb } from "../methods";



export const MergeAndUpload = async (BucketKey: string, vid: number) => {
  // Configure AWS
  AWS.config.update({ region: "us-west-2" });
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

  const BUCKET = process.env.S3MultiPartBucket!;
  const PREFIX = BucketKey + "/";

  s3.listObjectsV2({ Bucket: BUCKET, Prefix: PREFIX }, async (err, data) => {
    if (err) {
      console.error("Error listing S3 objects:", err);
      return;
    }
    const contents = data.Contents?.filter((item) => item.Key && item.Key !== PREFIX) || []; /// Fetches the Key
    const paths = [];
    createFolderAsync("TempSavedVideo") /// If the Folder Doesn't Exist 

    for (const [index, fileObj] of contents.entries()) {
      const Key = fileObj.Key!;
      console.log(`Downloading: ${Key}`);

      try {
        const fileData = await s3.getObject({ Bucket: BUCKET, Key }).promise();
        if (fileData.Body) {
          const filePath = `./TempSavedVideo/file-${index}.webm`; //
          paths.push(filePath);
          fs.writeFileSync(filePath, fileData.Body as Buffer);
          console.log(`Saved to: ${filePath}`);
        }
      } catch (err) {
        console.error(`Failed to download ${Key}:`, err);
      }
    }

    let merged = Ffmpeg();
    paths.forEach(video => {
      merged = merged.input(video);
    });

    const ffmpegPromise = () => {
      return new Promise<void>((resolve, reject) => {
        merged.on('error', (err: any) => console.error('Error:', err)).on('end', () => {
          console.log('Merging complete!');
        }).mergeToFile(`output.mp4`, './tmp').on("end", () => resolve()).on("error", (err) => reject());
      })
    };


    await ffmpegPromise();
    await CleanUpS3Bucket(BucketKey, PREFIX); /// Clean the Multipart Chuncked Bucket
    await UploadMergedVideo(process.env.S3MergeUploadLoaction!, "./output.mp4", BucketKey); /// Upload the Single file to S3 Bucket
    console.log("Download complete.");
  });


  const CleanUpS3Bucket = async (BucketKey: string, Prefix: string) => {
    try {
      /// list down all S3 Bucket Keys
      let ProcessDeleting = s3.listObjectsV2({ Bucket: BUCKET, Prefix: Prefix }, async (err, list) => {
        if (err) {
          console.error("Error listing S3 objects:", err);
          return;
        }

        let deletedKeys = [];
        if (list.Contents?.length) {
          for (let i = 0; i < list.Contents.length; i++) {
            let key = list.Contents[i].Key
            if (key) {
              deletedKeys.push({ Key: key })
            }
          }
        }
        let deleteFromS3 = s3.deleteObjects({
          Bucket: BUCKET,
          Delete: {
            Objects: deletedKeys,
            Quiet: false
          }
        }, (err, data) => {
          if (err) {
            console.log("Error In deleting the data")
            console.log(err)
          }
          console.log(data.Deleted);
        }).promise();

        await deleteFromS3
      }).promise();

      await ProcessDeleting;

    }
    catch (err) {
      console.log("Error in deleting the objects from the bucket", err)
    }
  }

  /// Creating Folder Logic and CleanUp Last Video
  async function createFolderAsync(folderName: string) {
    if (fs.existsSync("output.mp4")) {
      fs.unlinkSync("output.mp4")
    }
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
      console.log(`Folder '${folderName}' created successfully.`);
    }
    else {

      fs.rmdirSync(folderName, { recursive: true }); // delete the folder if exists and create the new one
      fs.mkdirSync(folderName);
    }
  }

  async function UploadMergedVideo(Bucket: string, filepath: string, filename: string) {
    try {
      const filstream = fs.createReadStream(filepath);
      let S3Upload = await s3.upload({
        Bucket: Bucket,
        Key: filename + ".mp4",
        Body: filstream,
        ACL: "public-read"
      }).promise();

      console.log(S3Upload.Location)

      await AddRecordingUrlToDb(S3Upload.Location, vid)

    }
    catch (err) {
      console.log("Error in Uploading the merged video", err);
    }
  }
}


