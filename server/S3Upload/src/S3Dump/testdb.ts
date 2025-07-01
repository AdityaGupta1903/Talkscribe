import prisma from "../db/lib/prisma";
import "dotenv/config";

const user = prisma.user.findMany();
user.then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
})

