import { container } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, roleMention } from "discord.js";

interface ReviewType {
	reviewId: string;
	courseCode: string;
	rating: number;
	reviewDescription: string;
}

export async function sendReviewToReviewsChannel(review: ReviewType) {
	const reviewsChannel = await container.client.channels.fetch(process.env.REVIEW_CHANNEL_ID!);
	if (!reviewsChannel || !reviewsChannel.isTextBased()) return;

	const reviewerRole = container.client.guilds.cache
		.get(process.env.DEV_GUILD_ID!)
		?.roles.cache.find((role) => role.name === "Reviewer");
	if (!reviewerRole) {
		container.logger.warn("Reviewer role not found.");
	}

	const { reviewId, courseCode, rating, reviewDescription } = review;

	const reviewEmbed = new EmbedBuilder()
		.setTitle(`Review #${reviewId} (${courseCode}) [${rating}*]`)
		.setDescription(`\`\`\`md\n${reviewDescription}\n\`\`\``)
		.setTimestamp(new Date());

	const approveReview = new ButtonBuilder()
		.setCustomId("approve_review_button")
		.setLabel("Approve")
		.setStyle(ButtonStyle.Success);

	const rejectReview = new ButtonBuilder()
		.setCustomId("reject_review_button")
		.setLabel("Reject")
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveReview, rejectReview);

	reviewsChannel.send({
		// TODO: add a util function to get role mentions
		content: `${reviewerRole ? roleMention(reviewerRole.id) + " a" : " A"} new review has been submitted.`,
		embeds: [reviewEmbed],
		components: [row]
	});
}
