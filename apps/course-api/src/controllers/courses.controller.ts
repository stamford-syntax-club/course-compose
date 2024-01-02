import { Request, Response } from "express";
import prismaClient from "../utils/prisma_utils";
import { paginate } from "../utils/pagination";
import { Prisma } from "../../.prisma/client";

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

	const query: Prisma.CourseFindManyArgs = {
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
	};

	try {
		const [courses, count] = await prismaClient.$transaction([
			prismaClient.course.findMany({
				...query,
				skip: pageSize * (pageNumber - 1),
				take: pageSize
			}),
			prismaClient.course.count({ where: query.where })
		]);

		const data = paginate(courses, pageSize, pageNumber, count);
		res.status(200).json(data);
	} catch (error) {
		console.log("Error: ", error);
		res.status(500).json({
			message: "Internal server error"
		});
	}
};

export { getAllCourses };
