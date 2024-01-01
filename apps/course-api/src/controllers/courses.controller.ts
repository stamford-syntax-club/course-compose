import { Request, Response } from "express";
import prismaClient from "../utils/prisma_utils";

// TODO: Add search api/courses?search=..
const getAllCourses = async (req: Request, res: Response) => {
	const pageSize = parseInt(req.query.pageSize as string) ? parseInt(req.query.pageSize as string) : 10;
	const pageNumber = parseInt(req.query.pageNumber as string) ? parseInt(req.query.pageNumber as string) : 1;

	try {
		const courses = await prismaClient.course.findMany({
			skip: pageSize * (pageNumber - 1),
			take: pageSize
		});
		return res.status(200).json(courses);
	} catch (error) {
		console.log("Error: ", error);
	}
};

export { getAllCourses };
