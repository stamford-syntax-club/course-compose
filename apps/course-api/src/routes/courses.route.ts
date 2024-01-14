import express from "express";
import { handleAddCourses, handleGetAllCourses, handleGetCourseByCode } from "@controllers/courses.controller";
import adminAuth from "@middlewares/admin";

const courseRouter = express.Router();

courseRouter.get("/", handleGetAllCourses);
courseRouter.get("/:code", handleGetCourseByCode);
courseRouter.post("/", adminAuth(), handleAddCourses);

export default courseRouter;
