import { container } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, roleMention } from "discord.js";
import { addReviewToCache } from "./review-utils";
import { ReviewType } from "./types/ReviewType";

export async function sendReviewToReviewsChannel(review: ReviewType) {
	const reviewsChannel = await container.client.channels.fetch(process.env.REVIEW_CHANNEL_ID!);
	if (!reviewsChannel || !reviewsChannel.isTextBased()) return;

	const reviewerRole = container.client.guilds.cache
		.get(process.env.DEV_GUILD_ID!)
		?.roles.cache.find((role) => role.name === "Reviewer");
	if (!reviewerRole) {
		container.logger.warn("Reviewer role not found.");
	}

	const { reviewId, courseCode, rating, reviewDescription, submittedDate } = review;

	const reviewEmbed = new EmbedBuilder()
		.setTitle(`Review #${reviewId} (${courseCode}) [${rating}*]`)
		.setDescription(`\`\`\`md\n${reviewDescription}\n\`\`\``)
		.setTimestamp(submittedDate);

	const approveReview = new ButtonBuilder()
		.setCustomId("approve_review_button")
		.setLabel("Approve")
		.setStyle(ButtonStyle.Success);

	const rejectReview = new ButtonBuilder()
		.setCustomId("reject_review_button")
		.setLabel("Reject")
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveReview, rejectReview);

	const boundReviewMessage = await reviewsChannel.send({
		content: reviewerRole ? roleMention(reviewerRole.id) : "@Reviewers", // TODO: XD
		embeds: [reviewEmbed],
		components: [row]
	});

	addReviewToCache(reviewId, {
		review: review,
		boundMessage: boundReviewMessage
	});
}
