import express, { Request, Response } from "express";
import cors from "cors";
import prismaClient from "./utils/prisma_utils";
import courseRouter from "./routes/courses.route";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(morgan("combined"));

app.get("/", (req: Request, res: Response) => {
	res.send("Welcome to Express & TypeScript Server");
});

app.get("/test", (req: Request, res: Response) => {
	prismaClient.course.findMany().then((courses) => {
		res.send(courses);
	});
});

app.use("/api/courses", courseRouter);

export default app;
