import express, { Request, Response } from "express";
import cors from "cors";
import prismaClient from "@utils/prisma_utils";
import courseRouter from "@routes/courses.route";
import morgan from "morgan";
import cacheEndpoint from "@middlewares/caching";

const app = express();

app.use(cors());
app.use(morgan("combined"));
app.use(cacheEndpoint);
app.use(express.json({limit: "50mb"}));

if (process.env.APP_ENV === "beta" || process.env.APP_ENV === "prod") {
	app.use(cacheEndpoint);
}

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
