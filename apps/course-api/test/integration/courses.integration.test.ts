import prismaClient from "../../src/utils/prisma_utils";
import { agent as request } from "supertest";
import app from "../../src/app";

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

const parseResponse = (res: any) => {
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

describe("Get all courses", () => {
	describe("GET /api/courses", () => {
		it("should paginate with pageNumber 1 and pageSize 10", async () => {
			const res = await request(app).get("/api/courses");
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

			expect(res.statusCode).toBe(200);
			expect(courses.length).toBe(4);
			expect(size).toBe(10);
			expect(number).toBe(1);
			expect(totalNumberOfItems).toBe(4);
			expect(totalPages).toBe(1);
		});
	});

	describe("GET /api/courses?pageSize=2&pageNumber=1", () => {
		it("should return the first 2 courses, totalPages = 2, totalNumberOfItems = 4", async () => {
			const res = await request(app).get("/api/courses?pageSize=2&pageNumber=1");
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

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
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

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
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

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
			const { size, number } = parseResponse(res);

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
			const { size, number } = parseResponse(res);

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
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

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
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

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
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

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
			const { courses, size, number, totalNumberOfItems, totalPages } = parseResponse(res);

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
