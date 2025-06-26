import express from "express";
import cors from "cors";
import "dotenv/config";
import * as AWS from "aws-sdk";
import fs from "fs";
import multer from "multer";

const app = express();
app.use(cors());

// Configuring to store the video online
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/tmp/my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

/// Configuring AWS settings
AWS.config.update({ region: "us-west-2" });
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    const filstream = fs.createReadStream(file?.path!);
    console.log(req.file);

    const uploadParams = {
      Bucket: "testbuket-s3-arn-1452555-xya",
      Key: `test-folder-name-from-cli/${Date.now()}-chunk191.mp4`,
      Body: filstream,
      ContentType: file?.mimetype, // optional but recommended
    };
    s3.upload(uploadParams, (err: any, data: any) => {
      if (err) {
        console.error("Upload failed:", err);
      } else {
        fs.unlinkSync(file?.path!);
        console.log("Buffer uploaded successfully:", data.Location);
      }
    });

    res.status(200).send({ "data-received": "received" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err });
  }
});

app.listen(3000, () => {
  console.log("Server is Running on Port" + " " + 3000);
});
