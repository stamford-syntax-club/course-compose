import { container } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import { Kafka } from "kafkajs";
import { processReviewDescription } from "./review-utils";
import { sendReviewToReviewsChannel } from "./send-review-to-reviews-channel";

// {"id":9,"academicYear":2020,"description":"this is a test review, ramune gogo!","rating":2,"status":"","votes":0,"course":{"code":"PHYS101"},"profile":{"id":""},"created_at":"0001-01-01T00:00:00Z","action":"submit"}
interface ReviewKafkaMessage {
	id: number;
	academicYear: number;
	description: string;
	rating: number;
	status: string;
	votes: number;
	course: {
		code: string;
	};
	profile: {
		id: string;
	};
	created_at: string;
	action: string;
}

const kafka = new Kafka({
	clientId: "ramune-kafka-reader",
	// TODO: broker:9092 should be based on an environment variable if running in docker
	brokers: ["localhost:9092"]
	// retry: {
	// 	maxRetryTime: 10000,
	// 	retries: 10
	// }
});

const consumer = kafka.consumer({ groupId: "ramune-group" });

export async function startKafkaConsumer() {
	container.logger.info("Starting Kafka consumer");

	await consumer.connect();
	await consumer.subscribe({ topic: "course-compose", fromBeginning: true });

	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			if (message.value) {
				container.logger.info({
					message: `Received message: ${message.value.toString()}`,
					topic,
					partition
				});

				const reviewMessageFromKafka: ReviewKafkaMessage = JSON.parse(message.value.toString());
				// submit, edit delete
				const action = reviewMessageFromKafka.action as "submit" | "edit" | "delete";

				const reviewFromKafka = {
					reviewId: reviewMessageFromKafka.id.toString(),
					courseCode: reviewMessageFromKafka.course.code,
					rating: reviewMessageFromKafka.rating,
					reviewDescription: reviewMessageFromKafka.description,
					submittedDate: new Date(reviewMessageFromKafka.created_at)
				};

				// TODO: extract each action to its own function
				switch (action) {
					case "submit":
						sendReviewToReviewsChannel(reviewFromKafka);
						break;
					case "edit":
						const foundReview = container.reviewsSent.get(reviewFromKafka.reviewId);

						const { reviewId, courseCode, rating, reviewDescription, submittedDate } = reviewFromKafka;

						try {
							if (foundReview) {
								const boundMessage = foundReview.boundMessage;

								if (!boundMessage.editable) {
									container.logger.warn("Message is not editable:", boundMessage.toJSON());
									return;
								}

								let descriptionContent: string | null = "%%REVIEW_MESSAGE_PLACEHOLDER%%";
								descriptionContent = processReviewDescription(
									descriptionContent,
									reviewDescription,
									4000
								);

								if (!descriptionContent) {
									container.logger.error("Review description is missing:", foundReview);
									descriptionContent = "Review description is missing.";
								}

								const reviewEmbed = new EmbedBuilder()
									.setTitle(`Review #${reviewId} (${courseCode}) [${rating}*]`)
									.setDescription(descriptionContent)
									.setTimestamp(submittedDate);

								await boundMessage.edit({
									embeds: [reviewEmbed]
								});

								return;
							}

							container.logger.warn("Review not found in cache:", reviewFromKafka.reviewId);
							container.logger.warn("Sending a new review instead.");

							return sendReviewToReviewsChannel(reviewFromKafka);
						} catch (error) {
							container.logger.error("Error editing message:", error);
						}

						break;
					case "delete":
						const foundReviewToDelete = container.reviewsSent.get(reviewFromKafka.reviewId);
						if (!foundReviewToDelete) return;

						try {
							if (!foundReviewToDelete.boundMessage.deletable) {
								container.logger.warn(
									"Message is not deletable:",
									foundReviewToDelete.boundMessage.toJSON()
								);

								return;
							}

							await foundReviewToDelete.boundMessage.delete();
						} catch (error) {
							container.logger.error("Error deleting message:", error);
						}

						break;
				}
			}
		}
	});
}
