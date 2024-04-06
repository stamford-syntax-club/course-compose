import { container } from "@sapphire/framework";
import { APIInteractionGuildMember, GuildMember, Message, userMention } from "discord.js";
import { SentReview } from "./types/SentReview";

export function getReviewObjectFromMessage(originalMessage: Message<boolean> | null) {
	if (!originalMessage) return null;

	// No embed means it's not a review review message
	if (!originalMessage.embeds.length) return null;

	// Review #123 (CSC123) [4.5*]
	const title = originalMessage.embeds[0].title;
	if (!title) {
		container.logger.warn("No title found in the review message:", originalMessage.toJSON());
		return null;
	}

	const reviewId = title.split(" ")[1].replace("#", "");
	const courseCode = title.split(" ")[2].replace("(", "").replace(")", "");
	const rating = parseFloat(title.split(" ")[3].replace("[", "").replace("*]", ""));
	const reviewDescription = originalMessage.embeds[0].description;
	const submittedDate = originalMessage.embeds[0].timestamp;

	// TODO: make a function that calls toJson recursively so embeds and stuff are properly logged
	if (!reviewDescription || !submittedDate) {
		container.logger.warn("Review description or submitted date is missing:", originalMessage.toJSON());
		return null;
	}

	return { reviewId, courseCode, rating, reviewDescription, submittedDate };
}

export function getMemberMention(member: GuildMember | APIInteractionGuildMember | null) {
	return member ? userMention(member.user?.id) : "UNKNOWN";
}

export function getSentReviewFromCache(reviewId: string) {
	return container.reviewsSent.get(reviewId);
}

export function addReviewToCache(reviewId: string, sentReview: SentReview) {
	if (container.reviewsSent.has(reviewId)) {
		container.logger.error("Review already exists in reviewsSent cache:", reviewId);
	}

	container.reviewsSent.set(reviewId, sentReview);
}

export function deleteReviewFromCache(reviewId: string) {
	if (!container.reviewsSent.delete(reviewId)) {
		container.logger.error("Review not found in reviewsSent cache:", reviewId);
	}
}

function createBasicAuthHeader(username: string, password: string) {
	return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

export async function approveReview(reviewId: string): Promise<{ result: Response; err: Error | null }> {
	// http://localhost:8003/api/admin/reviews
	// basic auth in apps/reviews-api/.env.development.local
	// body - approve
	// {
	//   "id":  1,
	//   "status": "APPROVED"
	// }

	// REVIEWS_API_ADMIN_USERNAME=USERNAME
	// REVIEWS_API_ADMIN_PASSWORD=PASSWORD

	// TODO: dynamic host based on env, reviews-api:8003
	const result = await fetch("http://localhost:8003/api/admin/reviews", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: createBasicAuthHeader(
				process.env.REVIEWS_API_ADMIN_USERNAME!,
				process.env.REVIEWS_API_ADMIN_PASSWORD!
			)
		},

		body: JSON.stringify({ id: parseInt(reviewId), status: "APPROVED" })
	});

	if (!result.ok) {
		container.logger.error(`Failed to approve review: ${result}`);
		return { result, err: new Error(`Failed to approve review: ${result.statusText}`) };
	}

	return { result, err: null };
}

export async function rejectReview(
	reviewId: string,
	rejectReason: string
): Promise<{ result: Response; err: Error | null }> {
	// http://localhost:8003/api/admin/reviews
	// basic auth in apps/reviews-api/.env.development.local
	// body - reject
	// {
	//   "id":  1,
	//   "status": "REJECTED"
	//   "rejectedReason": "Rejected for being a banana"
	// }

	// REVIEWS_API_ADMIN_USERNAME=USERNAME
	// REVIEWS_API_ADMIN_PASSWORD=PASSWORD

	// TODO: dynamic host based on env, reviews-api:8003
	const result = await fetch("http://localhost:8003/api/admin/reviews", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: createBasicAuthHeader(
				process.env.REVIEWS_API_ADMIN_USERNAME!,
				process.env.REVIEWS_API_ADMIN_PASSWORD!
			)
		},

		body: JSON.stringify({
			id: parseInt(reviewId),
			status: "REJECTED",
			rejectedReason: rejectReason
		})
	});

	if (!result.ok) {
		container.logger.error(`Failed to reject review: ${result}`);
		return { result, err: new Error(`Failed to reject review: ${result.statusText}`) };
	}

	return { result, err: null };
}
