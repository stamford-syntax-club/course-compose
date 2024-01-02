import prismaClient from "../../src/utils/prisma_utils";
import { getAllCourses } from "../../src/controllers/get-all-courses";

beforeAll(async () => {
	await prismaClient.$connect();
	await prismaClient.course.createMany({
		data: [
			{
				code: "ITE221",
				full_name: "Programming 1"
			},
			{
				code: "ITE222",
				full_name: "Programming 2"
			},
			{
				code: "ITE104",
				full_name: "Computer Organization"
			},
			{
				code: "PSY102",
				full_name: "Personality Development"
			}
		]
	});
});

describe("Get all courses", () => {
	describe("GET /api/courses", () => {
		it("should return all courses with default pagination", async () => {
			const searchString = "";

			const { courses, count } = await getAllCourses(searchString);

			expect(courses.length).toBe(4);
			expect(count).toBe(4);
		});
	});
});

afterAll(async () => {
	await prismaClient.$disconnect();
});
