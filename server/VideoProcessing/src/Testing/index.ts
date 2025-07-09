import "dotenv/config";
import * as AWS from "aws-sdk";
import fs from "fs";
import Ffmpeg from "fluent-ffmpeg";


const MergeAndUpload = async () => {
  // Configure AWS
  AWS.config.update({ region: "us-west-2" });
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

  const BUCKET = "testbuket-s3-arn-1452555-xya";
  const PREFIX = "test-folder-name-from-cli/";

  s3.listObjectsV2({ Bucket: BUCKET, Prefix: PREFIX }, async (err, data) => {
    if (err) {
      console.error("Error listing S3 objects:", err);
      return;
    }

    const contents = data.Contents?.filter((item) => item.Key && item.Key !== PREFIX) || [];

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
    merged
      .on('error', (err: any) => console.error('Error:', err))
      .on('end', () => {
        console.log('Merging complete!');
      })
      .mergeToFile('output.mp4', './tmp')

    console.log("Download complete.");
  });

  /// Creating Folder Logic
  async function createFolderAsync(folderName: string) {

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
      console.log(`Folder '${folderName}' created successfully.`);
    }
    else {

      fs.rmdirSync(folderName, { recursive: true }); // delete the folder if exists and create the new one
      fs.mkdirSync(folderName);
    }
  }

  async function CleanUp(folderName: string) { /// call this method after uploading to AWS bucket.
    if (fs.existsSync(folderName)) {
      fs.rmdirSync(folderName, { recursive: true }); // delete the folder if exists and create the new one
    }
    if (fs.existsSync("output.mp4")) {
      fs.unlinkSync("output.mp4")
    }

  }
}


