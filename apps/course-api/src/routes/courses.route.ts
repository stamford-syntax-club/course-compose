import express from "express";
import { handleGetAllCourses, handleGetCourseByCode } from "@controllers/courses.controller";

const courseRouter = express.Router();

courseRouter.get("/", handleGetAllCourses);
courseRouter.get("/:code", handleGetCourseByCode);

export default courseRouter;
