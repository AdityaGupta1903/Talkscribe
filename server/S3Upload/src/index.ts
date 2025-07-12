import express, { type Request, type Response, type NextFunction, json } from "express";
import cors from "cors";
import "dotenv/config";
import * as AWS from "aws-sdk";
import fs from "fs";
import multer from "multer";
import axios from "axios";
import cookieParser from "cookie-parser"
import { AddRecordingToDB, AddUserToDB, CheckIfUserIsAuthenticated, getCurrentRecordingSequence, getRecordings, verifyAndRetrieveUserEmail } from "./middleware";


const app = express();

/// middlewares 
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Configuring to store the video online
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/tmp/my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });


/// Configuring AWS settings
AWS.config.update({ region: "us-west-2" });
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

app.post("/upload", CheckIfUserIsAuthenticated, upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    let { currentUID, remoteUID } = JSON.parse(req.body?.rec_details);
    let getCurrentSequence = await getCurrentRecordingSequence(currentUID, remoteUID);
    let BucketKey = currentUID + ":" + remoteUID + "-" + getCurrentSequence
    const filstream = fs.createReadStream(file?.path!);
    console.log(req.file);

    const uploadParams = {
      Bucket: "talkscribe-buffer",
      Key: `${BucketKey}/${Date.now()}.mp4`,
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

    res.status(200).send({ "State": "Uploaded Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err });
  }
});

app.get("/code", async (req, res) => {
  try {
    let authCode = req.query.code;
    let response = await axios.post("https://oauth2.googleapis.com/token", {
      code: authCode,
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      redirect_uri: process.env.redirect_uri,
      grant_type: "authorization_code"
    },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    )
    console.log(response.data);
    if (response.data.refresh_token) {
      console.log(response.data.refresh_token)
      res.cookie("talkscribe_accessToken", response.data.id_token)
      res.cookie("talkscribe_refresh_token", response.data.refresh_token);
      let { UserEmail, UserName } = await verifyAndRetrieveUserEmail(response.data.id_token);
      if (UserEmail && UserName) {
        let resp = await AddUserToDB(UserEmail, UserName);
        if (resp) {
          res.cookie("UID", resp);
        }
      }
      res.redirect(`${process.env.Client_URL}/video`)
    }
    else {
      let { UserEmail, UserName } = await verifyAndRetrieveUserEmail(response.data.id_token);
      if (UserEmail && UserName) {
        let resp = await AddUserToDB(UserEmail, UserName)
        if (resp) {
          res.cookie("UID", resp);
        }
      }
      res.cookie("talkscribe_accessToken", response.data.id_token).redirect(`${process.env.Client_URL}/video`);
    }
  }
  catch (err) {
    res.status(500).redirect(`${process.env.Client_URL}/authError`);
  }
})

app.get("/loggedin", CheckIfUserIsAuthenticated, async (req, res) => {
  res.status(200).send({ authenticated: true });
})

app.get("/getUserId", async (req, res) => {
  try {
    let UID = req.cookies.UID;
    res.status(200).send({ UID: UID })
  }
  catch (err) {
    console.log(err);
    res.status(500).send({ "err": err });
  }
})

app.post("/stoprecording", async (req, res) => {
  let { currentUID, remoteUID } = JSON.parse(req.body?.rec_details);
  try {
    let getCurrentSequence = await getCurrentRecordingSequence(currentUID, remoteUID);
    let BucketKey = currentUID + ":" + remoteUID + "-" + getCurrentSequence
    let VideoId = await AddRecordingToDB(currentUID, remoteUID, BucketKey);
    if (VideoId != -1) {
      res.status(200).send({ message: `Video saved with id ${VideoId}` })
    }
    else {
      res.status(200).send({ message: `Failed to save video` })
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).send({ err: err });
  }
})

app.get("/ping", async (req, res) => { /// Just to test whether the server is running or not.
  res.status(200).send({ message: "pong" })
})

app.get("/getRecordings", CheckIfUserIsAuthenticated, async (req, res) => {
  try {
    let UID = req.cookies.UID;
    let UserRecordings = await getRecordings(UID);
    res.status(200).send({ "recordings": UserRecordings })
  }
  catch (err) {
    console.log(err);
    res.status(500).send({ "error": err });
  }
})


app.listen(3000, () => {
  console.log(process.env.Client_URL)
  console.log("Server is Running on Port" + " " + 3000);
});
