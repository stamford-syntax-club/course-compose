import express from "express";
import { handleGetAllCourses } from "../controllers/courses.controller";

const courseRouter = express.Router();

courseRouter.get("/", handleGetAllCourses);

export default courseRouter;
