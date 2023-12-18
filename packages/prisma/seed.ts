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

        // Seed data for Profile table
        const profileData = [
            { id: "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d" },
            { id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f" }, // This user wrote 2 reviews
            { id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" } // This user does not have any reviews (inactive user)
        ];

        await prisma.profile.createMany({ data: profileData });


		// Seed data for User table
		const activeUserData = [
			{ id: "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d" },
			{ id: "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f" }
		];

		await prisma.activeUser.createMany({ data: activeUserData });

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
