import express from "express";
import { handleAddCourses, handleGetAllCourses, handleGetCourseByCode } from "@controllers/courses.controller";

const courseRouter = express.Router();

courseRouter.get("/", handleGetAllCourses);
courseRouter.get("/:code", handleGetCourseByCode);

// TODO: should be protected with a basic auth
courseRouter.post("/", handleAddCourses);

export default courseRouter;
