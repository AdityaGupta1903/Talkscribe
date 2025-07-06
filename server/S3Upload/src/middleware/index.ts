import express, { type Request, type Response, type NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "../db/lib/prisma";
import axios from "axios";

export function CheckIfUserIsAuthenticated(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.talkscribe_accessToken;
    verifyAndRetrieveUserEmail(accessToken).then(() => {
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
export const verifyAndRetrieveUserEmail = async (idToken: string) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.client_id
    })
    const payload = ticket.getPayload();
    console.log(payload);
    const UserEmail = payload && payload["email"];
    const UserName = payload && payload["name"]
    return { UserEmail: UserEmail, UserName: UserName };
}
export const AddUserToDB = async (Email: string, UserName: string) => {
    try {
        let user = await prisma.user.findFirst({
            where: {
                Email: Email
            }
        });
        if (user) {
            return user.Id;
        }
        else {
            let addUser = await prisma.user.create({
                data: {
                    Email: Email,
                    Name: UserName
                }
            });
            console.log(addUser);
            return addUser.Id;
        }
    }
    catch (err) {
        console.log(err);
    }
}
