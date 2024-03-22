import prismaClient from "@utils/prisma_utils";
import { agent as request } from "supertest";
import app from "@root/src/app";

beforeAll(async () => {
	await prismaClient.$connect();
	await prismaClient.course.createMany({
		data: [
			{
				code: "ITE221",
				full_name: "Programming 1",
				prerequisites: ["ITE103"]
			},
			{
				code: "ITE222",
				full_name: "Programming 2",
				prerequisites: ["ITE221"]
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

    await prismaClient.profile.createMany({
        data: [
			{ id: "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e", isActive: true },
			{ id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f", isActive: true },
			{ id: "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d", isActive: true },
        ]
    })
	await prismaClient.review.createMany({
		data: [
			{
				academic_year: 2020,
				description: "I hate it",
				rating: 3,
				votes: 2,
				status: "APPROVED",
				course_id: 1,
				user_id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f"
			},
			{
				academic_year: 2021,
				description: "I hate it more",
				rating: 1.5,
				votes: 2,
				status: "APPROVED",
				course_id: 1,
				user_id: "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e"
			},
			{
				academic_year: 2021,
				description: "some pending review which should be excluded from aggregation",
				rating: 1.5,
				votes: 2,
				status: "PENDING",
				course_id: 1,
				user_id: "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d"
			}
		]
	});
});

const parsePaginatedResponse = (res: any) => {
	const courses = res.body.data;
	const { size, number } = res.body.pageInformation;
	const totalNumberOfItems = res.body.totalNumberOfItems;
	const totalPages = res.body.totalPages;

	return {
		courses,
		size,
		number,
		totalNumberOfItems,
		totalPages
	};
};

describe("Get course by code", () => {
	describe("GET /api/courses/ITE221", () => {
		it("should return course with code ITE221", async () => {
			const res = await request(app).get("/api/courses/ITE221");
			const { code, full_name, prerequisites, overall_ratings, reviews_count } = res.body;

			expect(res.statusCode).toBe(200);
			expect(code).toBe("ITE221");
			expect(full_name).toBe("Programming 1");
			expect(prerequisites).toEqual(["ITE103"]);
			expect(overall_ratings).toEqual(2.25); // (3+1.5)/2
			expect(reviews_count).toEqual(2);
		});
	});

	describe("GET /api/courses/KHING555", () => {
		it("should return 404 not found", async () => {
			const res = await request(app).get("/api/courses/KHING555");

			expect(res.statusCode).toBe(404);
			expect(res.body.message).toBe("Course not found");
		});
	});
});

describe("Get all courses", () => {
	describe("GET /api/courses", () => {
		it("should paginate with pageNumber 1 and pageSize 10", async () => {
			const res = await request(app).get("/api/courses");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(4);
			expect(size).toBe(10);
			expect(number).toBe(1);
			expect(totalNumberOfItems).toBe(4);
			expect(totalPages).toBe(1);
			expect(courses[0].overall_ratings).toBe(2.25);
			expect(courses[0].reviews_count).toBe(2);
		});
	});

	describe("GET /api/courses?pageSize=2&pageNumber=1", () => {
		it("should return the first 2 courses, totalPages = 2, totalNumberOfItems = 4", async () => {
			const res = await request(app).get("/api/courses?pageSize=2&pageNumber=1");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(2);
			expect(size).toBe(2);
			expect(number).toBe(1);
			expect(totalNumberOfItems).toBe(4);
			expect(totalPages).toBe(2);
			expect(courses[0].code).toBe("ITE221");
			expect(courses[1].code).toBe("ITE222");
		});
	});

	describe("GET /api/courses?pageSize=2&pageNumber=2", () => {
		it("should return the last 2 courses, totalPages = 2, totalNumberOfItems = 4", async () => {
			const res = await request(app).get("/api/courses?pageSize=2&pageNumber=2");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(2);
			expect(size).toBe(2);
			expect(number).toBe(2);
			expect(totalNumberOfItems).toBe(4);
			expect(totalPages).toBe(2);
			expect(courses[0].code).toBe("ITE104");
			expect(courses[1].code).toBe("PSY102");
		});
	});

	describe("GET /api/courses?pageSize=2&pageNumber=3", () => {
		it("should return empty array, totalPages = 2, totalNumberOfItems = 4", async () => {
			const res = await request(app).get("/api/courses?pageSize=2&pageNumber=3");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(0);
			expect(size).toBe(2);
			expect(number).toBe(3);
			expect(totalNumberOfItems).toBe(4);
			expect(totalPages).toBe(2);
		});
	});

	describe("GET /api/courses?pageSize=0&pageNumber=1", () => {
		it("should force pageSize to be default value (10)", async () => {
			const res = await request(app).get("/api/courses?pageSize=0&pageNumber=1");
			const { size, number } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(size).toBe(10);
			expect(number).toBe(1);
		});
	});

	describe("GET /api/courses?pageSize=-1&pageNumber=1", () => {
		it("should return 400 bad request)", async () => {
			const res = await request(app).get("/api/courses?pageSize=-1&pageNumber=1");

			expect(res.statusCode).toBe(400);
			expect(res.body.message).toBe("Invalid page size or page number");
		});
	});

	describe("GET /api/courses?pageSize=1&pageNumber=0", () => {
		it("should force pageNumber to be default value (1)", async () => {
			const res = await request(app).get("/api/courses?pageSize=1&pageNumber=0");
			const { size, number } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(size).toBe(1);
			expect(number).toBe(1);
		});
	});

	describe("GET /api/courses?pageSize=1&pageNumber=-1", () => {
		it("should return 400 bad request)", async () => {
			const res = await request(app).get("/api/courses?pageSize=1&pageNumber=-1");

			expect(res.statusCode).toBe(400);
			expect(res.body.message).toBe("Invalid page size or page number");
		});
	});

	describe("GET /api/courses?search=ITE", () => {
		it("should return 3 ITE courses", async () => {
			const res = await request(app).get("/api/courses?search=ITE");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(3);
			expect(size).toBe(10);
			expect(number).toBe(1);
			expect(totalNumberOfItems).toBe(3);
			expect(totalPages).toBe(1);
			expect(courses[0].code).toBe("ITE221");
			expect(courses[1].code).toBe("ITE222");
			expect(courses[2].code).toBe("ITE104");
		});
	});

	describe("GET /api/courses?search=ITE&pageSize=2&pageNumber=1", () => {
		it("should return the first 2 ITE courses, totalPages = 2, totalNumberOfItems = 3", async () => {
			const res = await request(app).get("/api/courses?search=ITE&pageSize=2&pageNumber=1");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(2);
			expect(size).toBe(2);
			expect(number).toBe(1);
			expect(totalNumberOfItems).toBe(3);
			expect(totalPages).toBe(2);
			expect(courses[0].code).toBe("ITE221");
			expect(courses[1].code).toBe("ITE222");
		});
	});

	describe("GET /api/courses?search=ITE&pageSize=2&pageNumber=2", () => {
		it("should return the remaining ITE courses, totalPages = 2, totalNumberOfItems = 3", async () => {
			const res = await request(app).get("/api/courses?search=ITE&pageSize=2&pageNumber=2");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(1);
			expect(size).toBe(2);
			expect(number).toBe(2);
			expect(totalNumberOfItems).toBe(3);
			expect(totalPages).toBe(2);
			expect(courses[0].code).toBe("ITE104");
		});
	});

	describe("GET /api/courses?search=Prog", () => {
		it("should return any course that contains 'Prog' ", async () => {
			const res = await request(app).get("/api/courses?search=Prog");
			const { courses, size, number, totalNumberOfItems, totalPages } = parsePaginatedResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(2);
			expect(size).toBe(10);
			expect(number).toBe(1);
			expect(totalNumberOfItems).toBe(2);
			expect(totalPages).toBe(1);
			expect(courses[0].code).toBe("ITE221");
			expect(courses[1].code).toBe("ITE222");
		});
	});
});

afterAll(async () => {
	await prismaClient.$disconnect();
});
