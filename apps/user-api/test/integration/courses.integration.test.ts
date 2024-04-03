import prismaClient from "@utils/prisma_utils";
import { agent as request } from "supertest";
import jwt from "jsonwebtoken";
import app from "@root/src/app";

beforeAll(async () => {
	await prismaClient.$connect();
	await prismaClient.profile.createMany({
		data: [
			{ id: "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e", username: "MichaelOxmaul", isActive: true },
			{ id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f", username: "FrankXD", isActive: true },
			{ id: "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d", username: "Ju", isActive: true }
		]
	});
});

describe("User API", () => {
	describe("GET /api/users", () => {
		it("should return user info", async () => {
			const userId = "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d";
			const token = jwt.sign(
				{
					email: "khing@students.stamford.edu",
					exp: Math.floor(Date.now() / 1000) + 60 * 10,
					sub: userId
				},
				process.env.JWT_SECRET || ""
			);

			const res = await request(app)
				.set({ Authorization: `Bearer ${token}` })
				.set({ "Content-Type": "application/json" })
				.get("/api/users");
			const { id, username, isActive } = res.body;

			expect(res.statusCode).toBe(200);
			expect(id).toBe(userId);
			expect(username).toBe("Ju");
			expect(isActive).toBe(true);
		});
		it("should return not logged in if no token provided", async () => {
			const res = await request(app).get("/api/users");

			expect(res.statusCode).toBe(400);
			expect(res.body.message).toBe("User not logged in");
		});
	});
});

afterAll(async () => {
	await prismaClient.$disconnect();
});
