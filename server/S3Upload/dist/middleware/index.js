"use strict";
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
exports.getRecordings = exports.AddRecordingToDB = exports.getCurrentRecordingSequence = exports.AddUserToDB = exports.verifyAndRetrieveUserEmail = void 0;
exports.CheckIfUserIsAuthenticated = CheckIfUserIsAuthenticated;
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = __importDefault(require("../db/lib/prisma"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const Queue_1 = require("../Queue");
function CheckIfUserIsAuthenticated(req, res, next) {
    var _a;
    const accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.talkscribe_accessToken;
    (0, exports.verifyAndRetrieveUserEmail)(accessToken).then(() => {
        next();
    }).catch((err) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("error1", err);
        try {
            let refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.talkscribe_refresh_token;
            if (refreshToken) {
                let accessToken = yield getAccessTokenFromRefreshToken(refreshToken);
                res.cookie("talkscribe_accessToken", accessToken);
                next();
            }
            else {
                res.redirect(`${process.env.Client_URL}`); // redirect to login page
            }
        }
        catch (err) {
            res.status(401).send("UNAUTHORIZED");
        }
    }));
}
const getAccessTokenFromRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
            refresh_token: refreshToken,
            client_id: process.env.client_id,
            client_secret: process.env.client_secret,
            grant_type: "refresh_token"
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        return response.data.id_token;
    }
    catch (err) {
        console.log(err);
    }
});
const verifyAndRetrieveUserEmail = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new google_auth_library_1.OAuth2Client();
    const ticket = yield client.verifyIdToken({
        idToken: idToken,
        audience: process.env.client_id
    });
    const payload = ticket.getPayload();
    console.log(payload);
    const UserEmail = payload && payload["email"];
    const UserName = payload && payload["name"];
    return { UserEmail: UserEmail, UserName: UserName };
});
exports.verifyAndRetrieveUserEmail = verifyAndRetrieveUserEmail;
const AddUserToDB = (Email, UserName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield prisma_1.default.user.findFirst({
            where: {
                Email: Email
            }
        });
        if (user) {
            return user.Id;
        }
        else {
            let addUser = yield prisma_1.default.user.create({
                data: {
                    Email: Email,
                    Name: UserName,
                    Id: (0, crypto_1.randomUUID)()
                }
            });
            console.log(addUser);
            return addUser.Id;
        }
    }
    catch (err) {
        console.log(err);
    }
});
exports.AddUserToDB = AddUserToDB;
const getCurrentRecordingSequence = (UID, RemoteUID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let resp = yield prisma_1.default.recordings.findMany({
            where: {
                User: {
                    Id: UID
                },
                RemoteUserId: RemoteUID
            }
        });
        return resp.length + 1;
    }
    catch (err) {
        console.log(err);
        return Math.abs(Math.random() * 1000);
    }
});
exports.getCurrentRecordingSequence = getCurrentRecordingSequence;
const AddRecordingToDB = (UID, RemoteUID, BucketKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let resp = yield prisma_1.default.recordings.create({
            data: {
                Date: new Date(),
                Processed: false,
                UserId: UID,
                RemoteUserId: RemoteUID,
            }
        });
        if (resp) {
            Queue_1.myQueue.add("ProcessVideo", { vid: resp.Id, BucketKey: BucketKey });
            return resp.Id;
        }
        else {
            return -1;
        }
    }
    catch (err) {
        console.log(err);
        return -1;
    }
});
exports.AddRecordingToDB = AddRecordingToDB;
const getRecordings = (UID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield prisma_1.default.user.findUnique({
            where: {
                Id: UID
            }
        });
        if (user) {
            let recordings = yield prisma_1.default.recordings.findMany({
                where: {
                    User: user
                }
            });
            return recordings;
        }
        else {
            return [];
        }
    }
    catch (err) {
        console.log(err);
        return [];
    }
});
exports.getRecordings = getRecordings;
