import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";
import userRouter from "@routes/user.route";
import { expressjwt } from "express-jwt";

if (!process.env.JWT_SECRET) {
	throw new Error("Missing JWT Secret");
}

const app = express();

app.use(cors());
app.use(morgan("combined"));

app.get("/", (_, res) => {
	res.send("Course Compose User Service");
});

app.use(
	"/api/users",
	expressjwt({
		secret: process.env.JWT_SECRET,
		credentialsRequired: false,
		algorithms: ["HS256"]
	}),
	userRouter
);

export default app;
