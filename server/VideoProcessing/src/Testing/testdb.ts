import prisma from "../db/lib/prisma";
import "dotenv/config";

const getAllUsers = async () => {
    let resp = await prisma.user.findMany();
    console.log(resp);
}

getAllUsers();