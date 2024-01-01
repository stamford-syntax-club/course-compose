import { Request, Response } from "express";
import prismaClient from "../utils/prisma_utils";
import { paginate } from "../utils/pagination";

// TODO: some caching here
const getAllCourses = async (req: Request, res: Response) => {
	const pageSize = parseInt(req.query.pageSize as string) ? parseInt(req.query.pageSize as string) : 10;
	const pageNumber = parseInt(req.query.pageNumber as string) ? parseInt(req.query.pageNumber as string) : 1;
	const search = (req.query.search as string) || "";

	if (pageSize < 1 || pageNumber < 1) {
		return res.status(400).json({
			message: "Invalid page size or page number"
		});
	}

	try {
		const courses = await prismaClient.course.findMany({
			where: {
				OR: [
					{
						full_name: {
							contains: search,
							mode: "insensitive"
						}
					},
					{
						code: {
							contains: search,
							mode: "insensitive"
						}
					}
				]
			},
			skip: pageSize * (pageNumber - 1),
			take: pageSize
		});

		const courseCount = await prismaClient.course.count({
			where: {
				OR: [
					{
						full_name: {
							contains: search,
							mode: "insensitive"
						}
					},
					{
						code: {
							contains: search,
							mode: "insensitive"
						}
					}
				]
			}
		});

		const data = paginate(courses, pageSize, pageNumber, courseCount);

		res.status(200).json(data);
	} catch (error) {
		console.log("Error: ", error);
	}
};

export { getAllCourses };
