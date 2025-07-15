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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const AWS = __importStar(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const axios_1 = __importDefault(require("axios"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
/// middlewares 
app.use((0, cors_1.default)({ origin: process.env.Client_URL, credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.Client_URL);
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
const createFolder = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        fs_1.default.access(folderName, (error) => {
            // To check if given directory 
            // already exists or not
            if (error) {
                // If current directory does not exist then create it
                fs_1.default.mkdir(folderName, { recursive: true }, (error) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("New Directory created successfully !!");
                    }
                });
            }
            else {
                console.log("Given Directory already exists !!");
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});
// Configuring to store the video online
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.cwd() + "/tmp/my-uploads");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
/// Configuring AWS settings
AWS.config.update({ region: "us-west-2" });
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });
app.post("/upload", middleware_1.CheckIfUserIsAuthenticated, upload.single("video"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const file = req.file;
        let { currentUID, remoteUID } = JSON.parse((_a = req.body) === null || _a === void 0 ? void 0 : _a.rec_details);
        let getCurrentSequence = yield (0, middleware_1.getCurrentRecordingSequence)(currentUID, remoteUID);
        let BucketKey = currentUID + ":" + remoteUID + "-" + getCurrentSequence;
        const filstream = fs_1.default.createReadStream(file === null || file === void 0 ? void 0 : file.path);
        console.log(req.file);
        const uploadParams = {
            Bucket: "talkscribe-buffer",
            Key: `${BucketKey}/${Date.now()}.mp4`,
            Body: filstream,
            ContentType: file === null || file === void 0 ? void 0 : file.mimetype, // optional but recommended
        };
        s3.upload(uploadParams, (err, data) => {
            if (err) {
                console.error("Upload failed:", err);
            }
            else {
                fs_1.default.unlinkSync(file === null || file === void 0 ? void 0 : file.path);
                console.log("Buffer uploaded successfully:", data.Location);
            }
        });
        res.status(200).send({ "State": "Uploaded Successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err: err });
    }
}));
app.get("/code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let authCode = req.query.code;
        let response = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
            code: authCode,
            client_id: process.env.client_id,
            client_secret: process.env.client_secret,
            redirect_uri: process.env.redirect_uri,
            grant_type: "authorization_code"
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        console.log(response.data);
        if (response.data.refresh_token) {
            console.log(response.data.refresh_token);
            res.cookie("talkscribe_accessToken", response.data.id_token);
            res.cookie("talkscribe_refresh_token", response.data.refresh_token);
            let { UserEmail, UserName } = yield (0, middleware_1.verifyAndRetrieveUserEmail)(response.data.id_token);
            if (UserEmail && UserName) {
                let resp = yield (0, middleware_1.AddUserToDB)(UserEmail, UserName);
                if (resp) {
                    res.cookie("UID", resp);
                }
            }
            res.redirect(`${process.env.Client_URL}/video`);
        }
        else {
            let { UserEmail, UserName } = yield (0, middleware_1.verifyAndRetrieveUserEmail)(response.data.id_token);
            if (UserEmail && UserName) {
                let resp = yield (0, middleware_1.AddUserToDB)(UserEmail, UserName);
                if (resp) {
                    res.cookie("UID", resp);
                }
            }
            res.cookie("talkscribe_accessToken", response.data.id_token).redirect(`${process.env.Client_URL}/video`);
        }
    }
    catch (err) {
        res.header("Access-Control-Allow-Origin", process.env.Client_URL);
        res.header("Access-Control-Allow-Credentials", "true");
        res.status(500).redirect(`${process.env.Client_URL}/authError`);
    }
}));
app.get("/loggedin", middleware_1.CheckIfUserIsAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    createFolder("/tmp/my-uploads");
    res.status(200).send({ authenticated: true });
}));
app.get("/getUserId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let UID = req.cookies.UID;
        res.status(200).send({ UID: UID });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "err": err });
    }
}));
app.post("/stoprecording", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { currentUID, remoteUID } = JSON.parse((_a = req.body) === null || _a === void 0 ? void 0 : _a.rec_details);
    try {
        let getCurrentSequence = yield (0, middleware_1.getCurrentRecordingSequence)(currentUID, remoteUID);
        let BucketKey = currentUID + ":" + remoteUID + "-" + getCurrentSequence;
        let VideoId = yield (0, middleware_1.AddRecordingToDB)(currentUID, remoteUID, BucketKey);
        if (VideoId != -1) {
            res.status(200).send({ message: `Video saved with id ${VideoId}` });
        }
        else {
            res.status(200).send({ message: `Failed to save video` });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err: err });
    }
}));
app.get("/ping", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("PING124");
    res.status(200).send({ message: "pong-1245588877" });
}));
app.get("/getRecordings", middleware_1.CheckIfUserIsAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let UID = req.cookies.UID;
        let UserRecordings = yield (0, middleware_1.getRecordings)(UID);
        res.status(200).send({ "recordings": UserRecordings });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "error": err });
    }
}));
app.listen(3000, () => {
    console.log(process.env.Client_URL);
    console.log("Server is Running on Port" + " " + 3000);
});
