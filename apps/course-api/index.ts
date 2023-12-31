import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import prismaClient from "./utils/prisma_utils";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8002;

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Express & TypeScript Server');
});

app.get('/test', (req: Request, res: Response) => {
    prismaClient.course.findMany().then((courses) => {
        res.send(courses);
    });
});

app.listen(port, () => {
    console.log(`Server is 🔥 at http://localhost:${port}`);
});