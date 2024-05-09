import { Request, Response } from "express";
import { paginate } from "@utils/pagination";
import { getAllCourses, getCourseByCode } from "@services/get-course.services";
import { getRedisClient } from "@utils/redis_utils";

const cacheTTL = 60 * 60 * 7; // cache will expire after 1 week

const handleGetAllCourses = async (req: Request, res: Response) => {
	const pageSize = parseInt(req.query.pageSize as string) ? parseInt(req.query.pageSize as string) : 10;
	const pageNumber = parseInt(req.query.pageNumber as string) ? parseInt(req.query.pageNumber as string) : 1;
	let sortBy = (req.query.sortBy as "name" | "reviewCount") || "reviewCount";
	let order = (req.query.order as "asc" | "desc") || "desc";
	const search = (req.query.search as string) || "";

	if (pageSize < 1 || pageNumber < 1) {
		return res.status(400).json({
			message: "Invalid page size or page number"
		});
	}

	try {
		const { courseResponse, count } = await getAllCourses(sortBy, order, search, pageSize, pageNumber);
		const data = paginate(courseResponse, pageSize, pageNumber, count);

		// fire and forget
		const redisClient = await getRedisClient();
		redisClient?.setEx(req.originalUrl, cacheTTL, JSON.stringify(data));

		res.status(200).json(data);
	} catch (error) {
		console.log("Error: ", error);
		res.status(500).json({
			message: "Internal server error"
		});
	}
};

const handleGetCourseByCode = async (req: Request, res: Response) => {
	const courseCode = req.params.code || "";

	try {
		const course = await getCourseByCode(courseCode);
		if (!course) {
			return res.status(404).json({
				message: "Course not found"
			});
		}

		const redisClient = await getRedisClient();
		redisClient?.setEx(req.originalUrl, cacheTTL, JSON.stringify(course));

		res.status(200).json(course);
	} catch (error) {
		console.log("Error: ", error);
		res.status(500).json({
			message: "Internal server error"
		});
	}
};

export { handleGetAllCourses, handleGetCourseByCode };
