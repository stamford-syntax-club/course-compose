import express from "express";
import { getAllCourses } from "../controllers/courses.controller";

const courseRouter = express.Router();

courseRouter.get("/", getAllCourses);

export default courseRouter;
