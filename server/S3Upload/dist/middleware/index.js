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
exports.CheckIfUserIsAuthenticated = CheckIfUserIsAuthenticated;
const google_auth_library_1 = require("google-auth-library");
const axios_1 = __importDefault(require("axios"));
function CheckIfUserIsAuthenticated(req, res, next) {
    var _a;
    const accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.talkscribe_accessToken;
    verify(accessToken).then(() => {
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
                res.redirect("http://localhost:5173");
            }
        }
        catch (err) {
            res.status(401).send("UNAUTHORISED");
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
const verify = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new google_auth_library_1.OAuth2Client();
    const ticket = yield client.verifyIdToken({
        idToken: idToken,
        audience: process.env.client_id
    });
    const payload = ticket.getPayload();
    console.log(payload);
    const userId = payload && payload["sub"];
});
