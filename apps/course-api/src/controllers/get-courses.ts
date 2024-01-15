import { Prisma } from "@root/.prisma/client";
import prismaClient from "@utils/prisma_utils";
import { mapCourseToCourseResponse } from "@utils/mapper";

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
			take: pageSize,
			include: {
				reviews: {
					select: {
						rating: true
					}
				}
			}
		}),
		prismaClient.course.count({ where: query.where })
	]);

	const courseResponse = courses.map((course) => mapCourseToCourseResponse(course));
	return {
		courseResponse,
		count
	};
};

export { getAllCourses, getCourseByCode };
