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
			},
			{
				code: "NOREVIEW101",
				full_name: "Course without reviews",
				prerequisites: []
			}
		];

		await prisma.course.createMany({ data: courseData });

		// Seed data for Profile table
		const profileData = [
			{ id: "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d", isActive: true },
			{ id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f", isActive: true }, // This user wrote 2 reviews
			{ id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" }, // This user does not have any reviews (inactive user)
			{ id: "d5a59cb2-1f22-4e23-8ef0-7108e54f842b", isActive: true },
			{ id: "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e", isActive: true },
			{ id: "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d", isActive: true },
			{ id: "3f9e87a9-6d27-4a09-8a0a-20e58d609315", isActive: true }
		];

		await prisma.profile.createMany({ data: profileData });

		// Seed data for Review table
		const reviewData = [
			{
				academic_year: 2022,
				description: "Great course, highly recommended!",
				rating: 5,
				votes: 10,
				status: "APPROVED",
				course_id: 1,
				user_id: "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d",
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
				user_id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
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
				user_id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
				created_at: new Date("2023-11-23T14:00:00"),
				updated_at: null
			},
			{
				academic_year: 2022,
				description: "I'm just here to fill up spaces XD",
				rating: 2,
				votes: 5,
				status: "APPROVED",
				course_id: 3,
				user_id: "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d",
				created_at: new Date("2023-11-23T14:00:00"),
				updated_at: null
			},
			{
				academic_year: 2022,
				description: "Me too!",
				rating: 2,
				votes: 5,
				status: "APPROVED",
				course_id: 3,
				user_id: "d5a59cb2-1f22-4e23-8ef0-7108e54f842b",
				created_at: new Date("2023-11-23T14:00:00"),
				updated_at: null
			},
			{
				academic_year: 2022,
				description: "Hello world!",
				rating: 2,
				votes: 5,
				status: "APPROVED",
				course_id: 3,
				user_id: "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e",
				created_at: new Date("2023-11-23T14:00:00"),
				updated_at: null
			},
			{
				academic_year: 2022,
				description: "Yikes!",
				rating: 2,
				votes: 5,
				status: "APPROVED",
				course_id: 3,
				user_id: "3f9e87a9-6d27-4a09-8a0a-20e58d609315",
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
