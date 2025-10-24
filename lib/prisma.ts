import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaDB = new PrismaClient().$extends(withAccelerate());

export default prismaDB;
