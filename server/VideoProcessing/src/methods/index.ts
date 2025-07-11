import "dotenv/config"
import prisma from "../db/lib/prisma";

export const AddRecordingUrlToDb = async (fileurl: string, vid: number) => {
    try {
        let UpdateUrl = await prisma.recordings.update({
            where: {
                Id: vid,
            },
            data: {
                Processed: true,
                PublicUrl: fileurl,
                Date: new Date(),
            }
        });

        if (UpdateUrl) {
            console.log("Merged Video Uploaded Successfully")
            return UpdateUrl.Id;
        }
    }
    catch (err) {
        console.log(err);
        return -1;
    }
}

