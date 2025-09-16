import express, { type Request, type Response, type NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "../db/lib/prisma";
import axios from "axios";
import { randomUUID } from "crypto";
import { myQueue } from "../Queue";
import * as AWS from "aws-sdk";



/// Configuring AWS setting
AWS.config.update({ region: "us-west-2" });
let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

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
                res.redirect(`${process.env.Client_URL}`); // redirect to login page
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
                    Name: UserName,
                    Id: randomUUID()
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

export const getCurrentRecordingSequence = async (UID: string, RemoteUID: string) => {
    try {
        let resp = await prisma.recordings.findMany({
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
}

export const AddRecordingToDB = async (UID: string, RemoteUID: string, BucketKey: string) => { /// When the stop recording is called
    try {
        let resp = await prisma.recordings.create({
            data: {
                Date: new Date(),
                Processed: false,
                UserId: UID,
                RemoteUserId: RemoteUID,
            }
        });
        if (resp) {
            myQueue.add("ProcessVideo", { vid: resp.Id, BucketKey: BucketKey });
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
}

export const getRecordings = async (UID: string) => {
    try {
        let user = await prisma.user.findUnique({
            where: {
                Id: UID
            }
        });
        if (user) {
            let recordings = await prisma.recordings.findMany({
                where: {
                    User: user
                }
            })
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
}

export const deleteRecording = async (BucketKey: string, Id: number) => {
    try {

        let deleteFromS3 = s3.deleteObject({
            Bucket: process.env.S3MergeUploadLoaction!,
            Key: BucketKey
        }, async (err, data) => {
            if (err) {
                console.log("Error In deleting the data")
                console.log(err)
                return false;
            }
            else {
                try {
                    let deletevid = await prisma.recordings.delete({
                        where: {
                            Id: Id
                        }
                    })
                    return true;
                }
                catch (err) {
                    return false
                }
            }
        }).promise();
        await deleteFromS3
        return true;
    }
    catch (err) {
        return false;
    }
}

export const CheckIfVideoAssociatedWithUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.talkscribe_accessToken;

        let { Id, PublicUrl } = req.body
        console.log(req.body);


        verifyAndRetrieveUserEmail(accessToken).then(async ({ UserEmail, UserName }) => {
            let transaction = await prisma.$transaction(async (tx) => {
                let User = await tx.user.findUnique({
                    where: {
                        Email: UserEmail
                    }
                })
                if (!User) {
                    throw new Error(`User Doesn't Exists`)
                }
                let recording = await tx.recordings.findUnique({
                    where: {
                        Id: Id,
                        User: User
                    }
                })
                return recording;
            })

            if (transaction) {
                next();
            }
            else {
                res.send(500).send({ error: "Video Not Associated with the User" })
            }
        })
    }
    catch (err) {
        console.log(err);

    }
}


