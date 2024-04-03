import express from "express";
import { handleGetUser } from "@controllers/user.controller";

const userRouter = express.Router();

userRouter.get("/", handleGetUser);

export default userRouter;
