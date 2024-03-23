// @root is needed for resolving .prisma/client when it's built
import { PrismaClient } from "@root/.prisma/client";
const prisma = new PrismaClient();

export default prisma;
