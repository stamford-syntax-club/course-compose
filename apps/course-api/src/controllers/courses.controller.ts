import { Request, Response } from "express";
import { paginate } from "../utils/pagination";
import { getAllCourses, getCourseByCode } from "./get-courses";

// TODO: some caching here
const handleGetAllCourses = async (req: Request, res: Response) => {
	const pageSize = parseInt(req.query.pageSize as string) ? parseInt(req.query.pageSize as string) : 10;
	const pageNumber = parseInt(req.query.pageNumber as string) ? parseInt(req.query.pageNumber as string) : 1;
	const search = (req.query.search as string) || "";

	if (pageSize < 1 || pageNumber < 1) {
		return res.status(400).json({
			message: "Invalid page size or page number"
		});
	}

	try {
		const { courses, count } = await getAllCourses(search, pageSize, pageNumber);
		const data = paginate(courses, pageSize, pageNumber, count);
		res.status(200).json(data);
	} catch (error) {
		console.log("Error: ", error);
		res.status(500).json({
			message: "Internal server error"
		});
	}
};

const handleGetCourseByCode = async (req: Request, res: Response) => {
	const courseCode = req.params.code;

	try {
		const course = await getCourseByCode(courseCode);
		if (!course) {
			return res.status(404).json({
				message: "Course not found"
			});
		}
		res.status(200).json(course);
	} catch (error) {
		console.log("Error: ", error);
		res.status(500).json({
			message: "Internal server error"
		});
	}
};

export { handleGetAllCourses, handleGetCourseByCode };
