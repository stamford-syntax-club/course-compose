import { Prisma } from "@root/.prisma/client";
import prismaClient from "@utils/prisma_utils";

// TODO: unit test this
const filterDuplicateCourse = (
	newCourses: Prisma.CourseCreateManyInput[],
	existingCourseCodes: Prisma.CourseCreateManyInput[]
) => {
	const courseMap: Record<string, number> = {};

	for (let i = 0; i < existingCourseCodes.length; i++) {
		const code = existingCourseCodes[i].code;
		courseMap[code] = 1;
	}

	for (let j = 0; j < newCourses.length; j++) {
		const code = newCourses[j].code;
		if (!courseMap[code]) {
			courseMap[code] = 1;
			continue;
		}
		courseMap[code]++;
	}

	const filteredCourses: Prisma.CourseCreateManyInput[] = [];
	for (let k = newCourses.length - 1; k >= 0; k--) {
		const code = newCourses[k].code;

		if (courseMap[code] === 1) {
			filteredCourses.push(newCourses[k]);
		}
	}

	console.log(courseMap);
	return filteredCourses;
};

const addCourses = async (newCourses: Prisma.CourseCreateManyInput[]) => {
	const existingCourses = await prismaClient.course.findMany();
	const filteredCourses = filterDuplicateCourse(newCourses, existingCourses);
	const result = await prismaClient.course.createMany({
		data: filteredCourses
	});

	return result;
};

export { addCourses };
