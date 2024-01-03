import { Prisma } from "../../.prisma/client";
import prismaClient from "../utils/prisma_utils";

function setupSearchQuery(search: string): Prisma.CourseFindManyArgs {
	return {
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
}

export async function getAllCourses(search: string, pageSize: number, pageNumber: number) {
	const query = setupSearchQuery(search);
	const [courses, count] = await prismaClient.$transaction([
		prismaClient.course.findMany({
			...query,
			skip: pageSize * (pageNumber - 1),
			take: pageSize
		}),
		prismaClient.course.count({ where: query.where })
	]);

	return {
		courses,
		count
	};
}
