import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
	try {
		// Seed data for Course table
		const courseData = [
			{
				code: "CSCI101",
				full_name: "Introduction to Computer Science",
				prerequisites: []
			},
			{ code: "MATH201", full_name: "Calculus I", prerequisites: [] },
			{
				code: "PHYS101",
				full_name: "Physics for Engineers",
				prerequisites: ["MATH201"]
			}
		];

		await prisma.course.createMany({ data: courseData });

		// Seed data for User table
		const userData = [
			{ username: "john_doe", email: "john.doe@example.com", verified: true },
			{
				username: "jane_smith",
				email: "jane.smith@example.com",
				verified: true
			},
			{
				username: "bob_jones",
				email: "bob.jones@example.com",
				verified: false
			}
		];

		await prisma.user.createMany({ data: userData });

		// Seed data for Review table
		const reviewData = [
			{
				academic_year: 2022,
				description: "Great course, highly recommended!",
				rating: 5,
				votes: 10,
				status: "APPROVED",
				course_id: 1,
				user_id: 1,
				created_at: new Date("2023-11-23T12:00:00"),
				updated_at: new Date("2023-11-23T12:30:00")
			},
			{
				academic_year: 2022,
				description: "The material was challenging but interesting.",
				rating: 4,
				votes: 8,
				status: "APPROVED",
				course_id: 2,
				user_id: 2,
				created_at: new Date("2023-11-23T13:00:00"),
				updated_at: null
			},
			{
				academic_year: 2022,
				description: "Not a fan of the teaching style.",
				rating: 2,
				votes: 5,
				status: "PENDING",
				course_id: 3,
				user_id: 3,
				created_at: new Date("2023-11-23T14:00:00"),
				updated_at: null
			}
		];

		await prisma.review.createMany({ data: reviewData });

		console.log("Data seeding completed successfully.");
	} catch (error) {
		console.error("Error seeding data:", error);
	} finally {
		await prisma.$disconnect();
	}
}

seed();
