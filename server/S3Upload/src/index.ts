import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import * as AWS from "aws-sdk";
import fs from "fs";
import multer from "multer";
import axios from "axios";
import cookieParser from "cookie-parser"
import { CheckIfUserIsAuthenticated } from "./middleware";



const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

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

app.post("/upload", CheckIfUserIsAuthenticated, upload.single("video"), async (req, res) => {
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

app.get('/testcookie', CheckIfUserIsAuthenticated, (req: Request, res: Response) => {
  console.log("User is Authenticated")
  res.status(200).send("User is Authenticated");
})

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
      res.redirect("http://localhost:5173/video")
    }
    else {
      res.cookie("talkscribe_accessToken", response.data.id_token).redirect("http://localhost:5173/video");
    }

  }
  catch (err) {
    res.status(500).redirect("http://localhost:5173/authError");
  }
})

app.get("/loggedin", CheckIfUserIsAuthenticated, async (req, res) => {
  res.status(200).send({ authenticated: true });
})

app.get('/getBucketName', CheckIfUserIsAuthenticated, async (req, res) => {

})

app.listen(3000, () => {
  console.log("Server is Running on Port" + " " + 3000);
});
