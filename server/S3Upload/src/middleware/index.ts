import express, { type Request, type Response, type NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

export function CheckIfUserIsAuthenticated(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.talkscribe_accessToken;
    verify(accessToken).then(() => {
        next();
    }).catch(async (err) => {
        console.log("error1", err);
        try {
            let refreshToken = req.cookies?.talkscribe_refresh_token
            if (refreshToken) {
                let accessToken = await getAccessTokenFromRefreshToken(refreshToken);
                res.cookie("talkscribe_accessToken", accessToken);
                next();
            }
            else {
                res.redirect("http://localhost:5173"); // redirect to login page
            }
        }
        catch (err) {
            res.status(401).send("UNAUTHORIZED")
        }
    })
}

const getAccessTokenFromRefreshToken = async (refreshToken: string) => {
    try {
        let response = await axios.post("https://oauth2.googleapis.com/token", {
            refresh_token: refreshToken,
            client_id: process.env.client_id,
            client_secret: process.env.client_secret,
            grant_type: "refresh_token"
        },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        )
        return response.data.id_token;
    }
    catch (err) {
        console.log(err);
    }
}
const verify = async (idToken: string) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.client_id
    })
    const payload = ticket.getPayload();
    console.log(payload);
    const userId = payload && payload["sub"];
}