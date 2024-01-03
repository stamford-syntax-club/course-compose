import { Prisma } from "../../.prisma/client";
import prismaClient from "../utils/prisma_utils";

const getCourseByCode = async (code: string) => {
	const course = await prismaClient.course.findUnique({
		where: {
			code: code
		}
	});

	return course;
};

const getAllCourses = async (search: string, pageSize: number, pageNumber: number) => {
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
};

export { getAllCourses, getCourseByCode };
